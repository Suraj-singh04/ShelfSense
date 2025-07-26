const mongoose = require("mongoose");

const suggestedPurchaseSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    retailerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Retailer",
      required: true,
    },
    inventoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected", "expired", "reassigned"],
      default: "pending",
    },
    suggestedAt: {
      type: Date,
      default: Date.now,
    },
    attempts: {
      type: Number,
      default: 1,
    },
    triedRetailers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Retailer" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("SuggestedPurchase", suggestedPurchaseSchema);
