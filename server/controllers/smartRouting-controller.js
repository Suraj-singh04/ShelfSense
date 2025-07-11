const Product = require("../../database/models/product-model");
const Inventory = require("../../database/models/inventory-model");
const getSmartRoutingSuggestion = require("../services/smartRoutingSuggestion");

const getExpiringProductSuggestions = async (req, res) => {
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

    const suggestions = [];

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

module.exports = {
  getExpiringProductSuggestions,
};
