const SuggestedPurchase = require("../../database/models/suggested-purchase-model");
const Purchase = require("../../database/models/purchase-model");
const Inventory = require("../../database/models/inventory-model");
const smartRoutingSuggestion = require("../services/smartRoutingSuggestion");
const fallbackSuggestionHandler = require("../services/fallback");

const pendingSuggestions = async (req, res) => {
  try {
    const suggestions = await SuggestedPurchase.find({
      retailerId: req.params.retailerId,
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

    inventoryItem.quantity -= suggestion.quantity;
    await inventoryItem.save();

    await Purchase.create({
      productId: suggestion.productId,
      retailerId: suggestion.retailerId,
      quantity: suggestion.quantity,
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
