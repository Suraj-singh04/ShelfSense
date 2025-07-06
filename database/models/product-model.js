const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema({
  batchId: { type: String, required: true },
  expiryDate: { type: Date, required: true },
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: String,
  batches: [batchSchema],
  qrPath: String,
});

module.exports = mongoose.model("Product", productSchema);
