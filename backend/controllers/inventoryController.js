const Inventory = require('../models/Inventory');

// Get all inventory items (optionally by category)
exports.getInventory = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.available === 'true') filter.isAvailable = true;

    const items = await Inventory.find(filter).sort({ category: 1, name: 1 });
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single item
exports.getInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create inventory item (admin)
exports.createInventoryItem = async (req, res) => {
  try {
    const item = new Inventory(req.body);
    await item.save();
    res.status(201).json({ success: true, item, message: 'Item created successfully!' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update inventory item (admin)
exports.updateInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
    res.json({ success: true, item, message: 'Item updated successfully!' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete inventory item (admin)
exports.deleteInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
    res.json({ success: true, message: 'Item deleted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Restock item (admin)
exports.restockItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

    item.stock += quantity;
    item.updatedAt = Date.now();
    await item.save();

    res.json({ success: true, item, message: `Restocked ${quantity} units!` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get inventory summary by category (admin dashboard)
exports.getInventorySummary = async (req, res) => {
  try {
    const summary = await Inventory.aggregate([
      {
        $group: {
          _id: '$category',
          totalItems: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          lowStockItems: {
            $sum: { $cond: [{ $lte: ['$stock', '$threshold'] }, 1, 0] }
          }
        }
      }
    ]);

    const lowStockItems = await Inventory.find({
      $expr: { $lte: ['$stock', '$threshold'] }
    });

    res.json({ success: true, summary, lowStockItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
