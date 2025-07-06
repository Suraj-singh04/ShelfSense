const mongoose = require("mongoose");

const RetailerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
  },
  salesData: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      unitsSold: Number,
      lastSold: Date,
    },
  ],
});


module.exports = mongoose.model("Retailer", RetailerSchema);
