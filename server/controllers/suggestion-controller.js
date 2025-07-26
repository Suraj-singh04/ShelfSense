const SuggestedPurchase = require("../../database/models/suggested-purchase-model");
const Purchase = require("../../database/models/purchase-model");
const Inventory = require("../../database/models/inventory-model");
const Product = require("../../database/models/product-model");
const Retailer = require("../../database/models/retailer-model");
const fallbackSuggestionHandler = require("../services/fallback");

const pendingSuggestions = async (req, res) => {
  try {
    const suggestions = await SuggestedPurchase.find({
      retailerId: req.userInfo.userId,
      status: "pending",
    }).populate("productId");

    res.status(200).json({ success: true, suggestions });
  } catch (err) {
    console.error("Fetch Suggestions Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const confirmSuggestion = async (req, res) => {
  try {
    const suggestion = await SuggestedPurchase.findById(
      req.params.suggestionId
    );
    if (!suggestion) {
      return res
        .status(404)
        .json({ message: "Suggestion not found or already confirmed" });
    }

    const inventoryItem = await Inventory.findById(suggestion.inventoryId);
    if (!inventoryItem || inventoryItem.quantity < suggestion.quantity) {
      return res.status(400).json({ message: "Not enough stock in inventory" });
    }

    const product = await Product.findById(suggestion.productId);
    const retailer = await Retailer.findById(suggestion.retailerId);

    // Decrement inventory
    inventoryItem.quantity -= suggestion.quantity;
    await inventoryItem.save();

    // Create a proper Purchase document
    await Purchase.create({
      retailerId: suggestion.retailerId,
      retailerName: retailer?.name,
      orders: [
        {
          productId: suggestion.productId,
          productName: product?.name,
          quantity: suggestion.quantity,
          totalPrice: suggestion.quantity * (inventoryItem.price || 0),
        },
      ],
      date: new Date(),
    });

    suggestion.status = "confirmed";
    await suggestion.save();

    res
      .status(200)
      .json({ message: "Suggestion confirmed and purchase completed" });
  } catch (err) {
    console.error("Confirm Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const rejectSuggestion = async (req, res) => {
  try {
    const suggestion = await SuggestedPurchase.findById(
      req.params.suggestionId
    );
    if (!suggestion || suggestion.status !== "pending") {
      return res
        .status(404)
        .json({ message: "Suggestion not found or not pending." });
    }

    suggestion.status = "rejected";
    await suggestion.save();
    await fallbackSuggestionHandler();

    res.status(200).json({ message: "Suggestion rejected successfully." });
  } catch (err) {
    console.error("Reject Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  pendingSuggestions,
  confirmSuggestion,
  rejectSuggestion,
};
