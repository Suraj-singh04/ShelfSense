const mongoose = require("mongoose");

const PurchaseSchema = new mongoose.Schema({
  retailerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Retailer",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Purchase", PurchaseSchema);
