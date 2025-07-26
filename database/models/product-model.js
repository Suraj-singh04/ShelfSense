const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema({
  batchId: { type: String, required: true },
  expiryDate: { type: Date, required: true },
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: String,
  price: {
    type: Number,
    default: 0,
  },
  batches: [batchSchema],
});



module.exports = mongoose.model("Product", productSchema);
