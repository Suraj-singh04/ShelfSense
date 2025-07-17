const Product = require("../../database/models/product-model");
const Inventory = require("../../database/models/inventory-model");
const getSmartRoutingSuggestion = require("../services/smartRoutingSuggestion");

const getExpiringProductSuggestions = async (req, res) => {
  const suggestions = [];
  try {
    const thresholdDays = 10;
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
    const suggestions = await SuggestedPurchase.find({
      retailerId: req.userInfo.userId,
    })
      .populate("productId")
      .populate("inventoryId");

    res.status(200).json({
      success: true,
      suggestions: suggestions.map((s) => ({
        productName: s.productId.name,
        quantity: s.quantity,
        status: s.status,
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
