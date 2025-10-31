const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    retailerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Retailer",
      required: true,
    },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        price: Number,
        image: String,
        quantity: Number,
      },
    ],
    totalAmount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shippingMethod: { type: String },
    shippingCost: { type: Number },
    promoCode: { type: String },
    finalAmount: { type: Number, required: true },
    currency: { type: String, default: "inr" },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["processing", "shipped", "delivered", "cancelled"],
      default: "processing",
    },

    stripeSessionId: String,
    stripePaymentIntentId: String,
    stripeInvoiceId: String,
    invoicePdf: String,
    invoiceUrl: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
