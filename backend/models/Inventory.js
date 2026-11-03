const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: {
    type: String,
    required: true,
    enum: ['base', 'sauce', 'cheese', 'veggie', 'meat']
  },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, default: 100, min: 0 },
  threshold: { type: Number, default: 20 },
  image: { type: String, default: '' },
  isAvailable: { type: Boolean, default: true },
  unit: { type: String, default: 'units' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

inventoryItemSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual to check if below threshold
inventoryItemSchema.virtual('isBelowThreshold').get(function () {
  return this.stock <= this.threshold;
});

module.exports = mongoose.model('Inventory', inventoryItemSchema);
