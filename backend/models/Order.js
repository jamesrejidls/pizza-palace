const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pizza: {
    base: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
    sauce: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
    cheese: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
    veggies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' }],
    meats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' }]
  },
  pizzaSnapshot: {
    base: { name: String, price: Number },
    sauce: { name: String, price: Number },
    cheese: { name: String, price: Number },
    veggies: [{ name: String, price: Number }],
    meats: [{ name: String, price: Number }]
  },
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'paid', 'order_received', 'in_kitchen', 'sent_to_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }],
  deliveryAddress: { type: String, required: true },
  paymentId: { type: String, default: '' },
  razorpayOrderId: { type: String, default: '' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

orderSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', orderSchema);
