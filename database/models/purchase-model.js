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
  image: String,
  status: {
    type: String,
    enum: ["pending", "completed", "cancelled"],
    default: "pending",
  },
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

PurchaseSchema.index({ retailerId: 1, date: -1 });
PurchaseSchema.index({ "orders.productId": 1 });

module.exports = mongoose.model("Purchase", PurchaseSchema);
