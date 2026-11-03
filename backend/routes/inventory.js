const express = require('express');
const router = express.Router();
const {
  getInventory,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  restockItem,
  getInventorySummary
} = require('../controllers/inventoryController');
const { protect, adminOnly } = require('../middleware/auth');

// Public/user routes
router.get('/', protect, getInventory);
router.get('/summary', protect, adminOnly, getInventorySummary);
router.get('/:id', protect, getInventoryItem);

// Admin routes
router.post('/', protect, adminOnly, createInventoryItem);
router.put('/:id', protect, adminOnly, updateInventoryItem);
router.delete('/:id', protect, adminOnly, deleteInventoryItem);
router.post('/:id/restock', protect, adminOnly, restockItem);

module.exports = router;
