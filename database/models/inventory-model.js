const mongoose = require("mongoose");

const InventorySchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  addedDate: {
    type: Date,
    default: Date.now,
  },
  currentStatus: {
    type: String,
    enum: ["in_inventory", "sent_to_retailer"],
    default: "in_inventory",
  },
  assignedRetailer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Retailer",
    default: null,
  },
});

module.exports = mongoose.model("Inventory", InventorySchema);