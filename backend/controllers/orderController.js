const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const { sendEmail, emailTemplates } = require('../utils/email');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay order
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body; // amount in rupees
    const options = {
      amount: amount * 100, // convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };

    const razorpayOrder = await razorpay.orders.create(options);
    res.json({ success: true, order: razorpayOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Place order after successful payment
exports.placeOrder = async (req, res) => {
  try {
    const {
      pizzaConfig,
      deliveryAddress,
      totalPrice,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    } = req.body;

    // Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    const isValidPayment = expectedSignature === razorpaySignature;

    // Fetch inventory items for snapshot
    const [base, sauce, cheese] = await Promise.all([
      Inventory.findById(pizzaConfig.base),
      Inventory.findById(pizzaConfig.sauce),
      Inventory.findById(pizzaConfig.cheese)
    ]);

    const veggies = await Inventory.find({ _id: { $in: pizzaConfig.veggies || [] } });
    const meats = await Inventory.find({ _id: { $in: pizzaConfig.meats || [] } });

    const order = new Order({
      user: req.user._id,
      pizza: {
        base: pizzaConfig.base,
        sauce: pizzaConfig.sauce,
        cheese: pizzaConfig.cheese,
        veggies: pizzaConfig.veggies || [],
        meats: pizzaConfig.meats || []
      },
      pizzaSnapshot: {
        base: { name: base.name, price: base.price },
        sauce: { name: sauce.name, price: sauce.price },
        cheese: { name: cheese.name, price: cheese.price },
        veggies: veggies.map(v => ({ name: v.name, price: v.price })),
        meats: meats.map(m => ({ name: m.name, price: m.price }))
      },
      totalPrice,
      deliveryAddress,
      paymentId: razorpayPaymentId,
      razorpayOrderId,
      paymentStatus: isValidPayment ? 'paid' : 'failed',
      status: isValidPayment ? 'order_received' : 'cancelled',
      statusHistory: [{
        status: isValidPayment ? 'order_received' : 'cancelled',
        timestamp: new Date(),
        note: isValidPayment ? 'Payment verified, order placed.' : 'Payment verification failed.'
      }]
    });

    await order.save();

    if (isValidPayment) {
      // Deduct inventory stock
      await deductStock(pizzaConfig);

      // Check low stock and send alert
      await checkAndAlertLowStock();

      // Send order confirmation email
      await sendEmail({
        to: req.user.email,
        subject: 'Order Confirmed - Pizza Palace 🍕',
        html: emailTemplates.orderConfirmation(req.user.name, order)
      });
    }

    await order.populate('pizza.base pizza.sauce pizza.cheese pizza.veggies pizza.meats');

    res.status(201).json({
      success: true,
      order,
      message: isValidPayment ? 'Order placed successfully!' : 'Payment failed.'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Simulate payment success (test mode)
exports.simulatePaymentSuccess = async (req, res) => {
  try {
    const {
      pizzaConfig,
      deliveryAddress,
      totalPrice,
      razorpayOrderId
    } = req.body;

    const [base, sauce, cheese] = await Promise.all([
      Inventory.findById(pizzaConfig.base),
      Inventory.findById(pizzaConfig.sauce),
      Inventory.findById(pizzaConfig.cheese)
    ]);

    const veggies = await Inventory.find({ _id: { $in: pizzaConfig.veggies || [] } });
    const meats = await Inventory.find({ _id: { $in: pizzaConfig.meats || [] } });

    const simulatedPaymentId = `pay_test_${Date.now()}`;

    const order = new Order({
      user: req.user._id,
      pizza: {
        base: pizzaConfig.base,
        sauce: pizzaConfig.sauce,
        cheese: pizzaConfig.cheese,
        veggies: pizzaConfig.veggies || [],
        meats: pizzaConfig.meats || []
      },
      pizzaSnapshot: {
        base: { name: base.name, price: base.price },
        sauce: { name: sauce.name, price: sauce.price },
        cheese: { name: cheese.name, price: cheese.price },
        veggies: veggies.map(v => ({ name: v.name, price: v.price })),
        meats: meats.map(m => ({ name: m.name, price: m.price }))
      },
      totalPrice,
      deliveryAddress,
      paymentId: simulatedPaymentId,
      razorpayOrderId: razorpayOrderId || `order_test_${Date.now()}`,
      paymentStatus: 'paid',
      status: 'order_received',
      statusHistory: [{
        status: 'order_received',
        timestamp: new Date(),
        note: 'Test payment successful, order placed.'
      }]
    });

    await order.save();
    await deductStock(pizzaConfig);
    await checkAndAlertLowStock();

    await sendEmail({
      to: req.user.email,
      subject: 'Order Confirmed - Pizza Palace 🍕',
      html: emailTemplates.orderConfirmation(req.user.name, order)
    }).catch(err => console.log('Email err:', err.message));

    await order.populate('pizza.base pizza.sauce pizza.cheese pizza.veggies pizza.meats');

    res.status(201).json({ success: true, order, message: 'Test order placed successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('pizza.base pizza.sauce pizza.cheese pizza.veggies pizza.meats', 'name price category')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single order
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('pizza.base pizza.sauce pizza.cheese pizza.veggies pizza.meats', 'name price category');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    // Check ownership or admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .populate('pizza.base pizza.sauce pizza.cheese pizza.veggies pizza.meats', 'name price category')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['order_received', 'in_kitchen', 'sent_to_delivery', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    order.status = status;
    order.statusHistory.push({ status, timestamp: new Date(), note: note || '' });
    await order.save();

    // Notify user via email
    await sendEmail({
      to: order.user.email,
      subject: `Order Update - Pizza Palace 🍕`,
      html: emailTemplates.orderStatusUpdate(order.user.name, order._id.toString(), status)
    }).catch(err => console.log('Email err:', err.message));

    res.json({ success: true, order, message: `Order status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper: Deduct stock after order
async function deductStock(pizzaConfig) {
  const updates = [
    { id: pizzaConfig.base, qty: 1 },
    { id: pizzaConfig.sauce, qty: 1 },
    { id: pizzaConfig.cheese, qty: 1 },
    ...(pizzaConfig.veggies || []).map(id => ({ id, qty: 1 })),
    ...(pizzaConfig.meats || []).map(id => ({ id, qty: 1 }))
  ];

  for (const { id, qty } of updates) {
    await Inventory.findByIdAndUpdate(id, { $inc: { stock: -qty }, updatedAt: Date.now() });
  }
}

// Helper: Check low stock and alert admin
async function checkAndAlertLowStock() {
  const lowStockItems = await Inventory.find({
    $expr: { $lte: ['$stock', '$threshold'] }
  });

  if (lowStockItems.length > 0) {
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: '⚠️ Low Stock Alert - Pizza Palace',
      html: emailTemplates.stockAlert(lowStockItems)
    }).catch(err => console.log('Stock alert email error:', err.message));
  }
}
