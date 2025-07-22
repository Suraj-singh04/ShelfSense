const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  productName: String,
  quantity: {
    type: Number,
    required: true,
  },
  totalPrice: Number,
});

const PurchaseSchema = new mongoose.Schema({
  retailerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Retailer",
    required: true,
  },
  retailerName: String,
  orders: [OrderItemSchema],
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Purchase", PurchaseSchema);
