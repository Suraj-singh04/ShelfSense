const mongoose = require("mongoose");

const SalesEventSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: { type: String, required: true },
    unitsSold: { type: Number, required: true },
    priceAtSale: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    saleDate: { type: Date, default: Date.now },
    batchId: { type: String },
  },
  { _id: true }
);

const RetailerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  salesData: [SalesEventSchema],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

RetailerSchema.index({ "salesData.productId": 1, "salesData.saleDate": -1 });

module.exports = mongoose.model("Retailer", RetailerSchema);
