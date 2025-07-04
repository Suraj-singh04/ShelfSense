const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: String,
  expiryDate: {
    type: Date,
    required: true,
  },
  batchId: String,
  qrPath: String 
});

module.exports = mongoose.model("Product", ProductSchema);
