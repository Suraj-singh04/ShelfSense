const Product = require("../../database/models/product-model");
const Inventory = require("../../database/models/inventory-model");
const Retailer = require("../../database/models/retailer-model");
const SuggestedPurchase = require("../../database/models/suggested-purchase-model");
const getSmartRoutingSuggestion = require("../services/smartRoutingSuggestion");
const {
  generateSuggestionsForExpiringProducts,
} = require("../services/generateSuggestions");

let lastRunAt = 0;
const THROTTLE_MS = 60_000;

async function maybeGenerate() {
  const now = Date.now();
  if (now - lastRunAt > THROTTLE_MS) {
    await generateSuggestionsForExpiringProducts();
    lastRunAt = now;
  }
}

const getExpiringProductSuggestions = async (req, res) => {
  const suggestions = [];
  try {
    const thresholdDays = 60;
    const thresholdDate = new Date(
      Date.now() + thresholdDays * 24 * 60 * 60 * 1000
    );

    const expiringInventory = await Inventory.find({
      expiryDate: { $lte: thresholdDate },
      currentStatus: "in_inventory",
      quantity: { $gt: 0 },
    });

    for (const inventoryItem of expiringInventory) {
      const suggestion = await getSmartRoutingSuggestion(
        inventoryItem.productId
      );
      const product = await Product.findById(inventoryItem.productId);

      if (suggestion.message?.startsWith("No retailer has sales history")) {
        continue;
      }

      suggestions.push({
        product: {
          id: product._id,
          name: product.name,
          expiresInDays: Math.ceil(
            (new Date(inventoryItem.expiryDate) - Date.now()) /
              (1000 * 60 * 60 * 24)
          ),
        },
        suggestion,
      });
    }

    res.status(200).json({ success: true, suggestions });
  } catch (error) {
    console.error("Smart routing error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getRetailerSuggestions = async (req, res) => {
  try {
    await maybeGenerate();

    const retailer = await Retailer.findOne({ userId: req.userInfo.userId });
    if (!retailer) {
      return res
        .status(404)
        .json({ success: false, message: "Retailer profile not found" });
    }

    const suggestions = await SuggestedPurchase.find({
      retailerId: retailer._id,
    })
      .populate("productId")
      .populate("inventoryId");

    res.status(200).json({
      success: true,
      suggestions: suggestions.map((s) => ({
        suggestionId: s._id.toString(),
        productName: s.productId?.name ?? "Unknown",
        quantity: s.quantity,
        status: s.status,
        attempts: s.attempts ?? 1,
        createdAt: s.createdAt,
      })),
    });
  } catch (err) {
    console.error("Retailer suggestions error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getAllSuggestions = async (req, res) => {
  try {
    const suggestions = await SuggestedPurchase.find()
      .populate("productId")
      .populate("retailerId");

    res.status(200).json({
      success: true,
      suggestions: suggestions.map((s) => ({
        productName: s.productId?.name || "Unknown",
        retailerName: s.retailerId?.name || "Unknown",
        quantity: s.quantity,
        status: s.status,
        createdAt: s.createdAt,
      })),
    });
  } catch (err) {
    console.error("Admin suggestions error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getExpiringProductSuggestions,
  getRetailerSuggestions,
  getAllSuggestions,
};
