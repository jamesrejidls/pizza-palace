const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  placeOrder,
  simulatePaymentSuccess,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect, adminOnly, requireEmailVerification } = require('../middleware/auth');

router.post('/create-razorpay-order', protect, requireEmailVerification, createRazorpayOrder);
router.post('/place', protect, requireEmailVerification, placeOrder);
router.post('/simulate-success', protect, requireEmailVerification, simulatePaymentSuccess);
router.get('/my-orders', protect, getMyOrders);
router.get('/all', protect, adminOnly, getAllOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;
