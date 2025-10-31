const SuggestedPurchase = require("../../database/models/suggested-purchase-model");
const Purchase = require("../../database/models/purchase-model");
const Inventory = require("../../database/models/inventory-model");
const Product = require("../../database/models/product-model");
const Retailer = require("../../database/models/retailer-model");
const DynamicSuggestionEngine = require("../services/dynamicSuggestionEngine"); // FIX

/**
 * Get all pending suggestions for the logged-in retailer
 */
const pendingSuggestions = async (req, res) => {
  try {
    const retailer = await Retailer.findOne({ userId: req.userInfo.userId });
    if (!retailer) {
      return res
        .status(404)
        .json({ success: false, message: "Retailer not found" });
    }

    const suggestions = await SuggestedPurchase.find({
      retailerId: retailer._id,
      status: "pending",
    }).populate("productId");

    res.status(200).json({ success: true, suggestions });
  } catch (err) {
    console.error("[SUGGESTIONS] Fetch error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Confirm a suggestion, decrement inventory, and create a purchase record
 */
const confirmSuggestion = async (req, res) => {
  try {
    const suggestion = await SuggestedPurchase.findById(
      req.params.suggestionId
    );
    if (!suggestion || suggestion.status !== "pending") {
      return res.status(404).json({
        success: false,
        message: "Suggestion not found or already processed",
      });
    }

    const inventoryItem = await Inventory.findById(suggestion.inventoryId);
    if (!inventoryItem || inventoryItem.quantity < suggestion.quantity) {
      return res
        .status(400)
        .json({ success: false, message: "Not enough stock in inventory" });
    }

    const product = await Product.findById(suggestion.productId);
    const retailer = await Retailer.findById(suggestion.retailerId);

    // Decrement inventory
    inventoryItem.quantity -= suggestion.quantity;
    await inventoryItem.save();

    // Determine price (from inventory or fallback to product)
    const unitPrice = inventoryItem.price || product?.price || 0;

    // Create a purchase record
    await Purchase.create({
      retailerId: suggestion.retailerId,
      retailerName: retailer?.name,
      orders: [
        {
          productId: suggestion.productId,
          productName: product?.name,
          quantity: suggestion.quantity,
          totalPrice: suggestion.quantity * unitPrice,
        },
      ],
      date: new Date(),
    });

    suggestion.status = "confirmed";
    await suggestion.save();

    res.status(200).json({
      success: true,
      message: "Suggestion confirmed and purchase completed",
    });
  } catch (err) {
    console.error("[SUGGESTIONS] Confirm error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Reject a suggestion and try reassigning to another retailer
 */
const rejectSuggestion = async (req, res) => {
  try {
    const suggestion = await SuggestedPurchase.findById(
      req.params.suggestionId
    );
    if (!suggestion || suggestion.status !== "pending") {
      return res.status(404).json({
        success: false,
        message: "Suggestion not found or not pending",
      });
    }

    suggestion.status = "rejected";
    await suggestion.save();

    // Try fallback reassignment using dynamic engine
    await DynamicSuggestionEngine.handleExpiredSuggestion(suggestion);

    res.status(200).json({
      success: true,
      message: "Suggestion rejected and reassigned if possible",
    });
  } catch (err) {
    console.error("[SUGGESTIONS] Reject error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  pendingSuggestions,
  confirmSuggestion,
  rejectSuggestion,
};
