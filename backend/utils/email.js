const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    const mailOptions = {
      from: `"Pizza Palace" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };
    await transporter.sendMail(mailOptions);
    console.log(`✉️ Email sent to ${to}`);
  } catch (error) {
    console.error('❌ Email error:', error.message);
    throw error;
  }
};

const emailTemplates = {
  verifyEmail: (name, verificationUrl) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #e63946, #ff6b35); padding: 40px; text-align: center;">
        <h1 style="margin: 0; font-size: 32px;">🍕 Pizza Palace</h1>
        <p style="margin: 8px 0 0; opacity: 0.9;">Verify Your Email</p>
      </div>
      <div style="padding: 40px;">
        <h2>Hello, ${name}! 👋</h2>
        <p style="color: #ccc; line-height: 1.6;">Welcome to Pizza Palace! Please verify your email address to get started and enjoy our delicious pizzas.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${verificationUrl}" style="background: linear-gradient(135deg, #e63946, #ff6b35); color: white; padding: 16px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block;">Verify Email Address</a>
        </div>
        <p style="color: #999; font-size: 14px;">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
      </div>
    </div>
  `,

  resetPassword: (name, resetUrl) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #e63946, #ff6b35); padding: 40px; text-align: center;">
        <h1 style="margin: 0; font-size: 32px;">🍕 Pizza Palace</h1>
        <p style="margin: 8px 0 0; opacity: 0.9;">Password Reset Request</p>
      </div>
      <div style="padding: 40px;">
        <h2>Hello, ${name}!</h2>
        <p style="color: #ccc; line-height: 1.6;">We received a request to reset your password. Click the button below to reset it.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #e63946, #ff6b35); color: white; padding: 16px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #999; font-size: 14px;">This link expires in 1 hour. If you didn't request a password reset, ignore this email.</p>
      </div>
    </div>
  `,

  orderConfirmation: (name, order) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #e63946, #ff6b35); padding: 40px; text-align: center;">
        <h1 style="margin: 0; font-size: 32px;">🍕 Pizza Palace</h1>
        <p style="margin: 8px 0 0; opacity: 0.9;">Order Confirmed!</p>
      </div>
      <div style="padding: 40px;">
        <h2>Thank you, ${name}! 🎉</h2>
        <p style="color: #ccc;">Your pizza is being prepared. Order ID: <strong>#${order._id.toString().slice(-8).toUpperCase()}</strong></p>
        <div style="background: #16213e; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 12px; color: #ff6b35;">Order Summary</h3>
          <p style="margin: 4px 0; color: #ccc;">Base: ${order.pizzaSnapshot?.base?.name}</p>
          <p style="margin: 4px 0; color: #ccc;">Sauce: ${order.pizzaSnapshot?.sauce?.name}</p>
          <p style="margin: 4px 0; color: #ccc;">Cheese: ${order.pizzaSnapshot?.cheese?.name}</p>
          <p style="margin: 4px 0; color: #ccc;">Veggies: ${order.pizzaSnapshot?.veggies?.map(v => v.name).join(', ') || 'None'}</p>
          <p style="margin: 12px 0 0; font-size: 18px; font-weight: bold; color: #e63946;">Total: ₹${order.totalPrice}</p>
        </div>
        <p style="color: #999; font-size: 14px;">Track your order status in the app.</p>
      </div>
    </div>
  `,

  stockAlert: (items) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #f59e0b, #ef4444); padding: 40px; text-align: center;">
        <h1 style="margin: 0; font-size: 32px;">⚠️ Stock Alert</h1>
        <p style="margin: 8px 0 0; opacity: 0.9;">Pizza Palace Inventory Warning</p>
      </div>
      <div style="padding: 40px;">
        <h2>Low Stock Warning!</h2>
        <p style="color: #ccc;">The following items have fallen below the threshold:</p>
        <div style="background: #16213e; border-radius: 12px; padding: 20px; margin: 20px 0;">
          ${items.map(item => `
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ffffff10;">
              <span style="color: #fff;">${item.name} (${item.category})</span>
              <span style="color: #ef4444; font-weight: bold;">${item.stock} ${item.unit} remaining</span>
            </div>
          `).join('')}
        </div>
        <p style="color: #999;">Please restock these items soon to avoid service interruptions.</p>
      </div>
    </div>
  `,

  orderStatusUpdate: (name, orderId, status) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #e63946, #ff6b35); padding: 40px; text-align: center;">
        <h1 style="margin: 0; font-size: 32px;">🍕 Pizza Palace</h1>
        <p style="margin: 8px 0 0; opacity: 0.9;">Order Status Update</p>
      </div>
      <div style="padding: 40px;">
        <h2>Hi ${name}!</h2>
        <p style="color: #ccc;">Your order <strong>#${orderId.slice(-8).toUpperCase()}</strong> status has been updated to:</p>
        <div style="background: #16213e; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="font-size: 24px; font-weight: bold; color: #ff6b35; margin: 0;">${status.replace(/_/g, ' ').toUpperCase()}</p>
        </div>
        <p style="color: #999;">Log in to track your order in real time.</p>
      </div>
    </div>
  `
};

module.exports = { sendEmail, emailTemplates };
