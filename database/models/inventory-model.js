const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  batchId: { type: String, required: true },
  price: {
    type: Number,
    default: 0,
  },
  quantity: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
  currentStatus: {
    type: String,
    enum: ["in_inventory", "assigned", "sold", "expired"],
    default: "in_inventory",
  },
  assignedRetailer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Retailer",
    default: null,
  },
  addedDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Inventory", inventorySchema);
