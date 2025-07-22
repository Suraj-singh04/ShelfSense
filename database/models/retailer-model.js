const mongoose = require("mongoose");

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
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Retailer", RetailerSchema);
