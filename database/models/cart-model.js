const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    retailerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Retailer",
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: String,
        price: Number,
        image: String,
        quantity: { type: Number, required: true, default: 1 },
      },
    ],
    shippingMethod: { type: String, default: "Standard Delivery" },
    shippingCost: { type: Number, default: 5 },
    promoCode: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
