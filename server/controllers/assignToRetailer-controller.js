const Product = require("../../database/models/product-model");
const Inventory = require("../../database/models/inventory-model");
const getSmartRoutingSuggestion = require("../services/smartRoutingSuggestion");
const SuggestedPurchase = require("../../database/models/suggested-purchase-model");

const assignRetailersToExpiringProducts = async (req, res) => {
  try {
    const thresholdDays = 10;
    const thresholdDate = new Date(
      Date.now() + thresholdDays * 24 * 60 * 60 * 1000
    );

    // Get products that are expiring soon
    const expiringProducts = await Product.find({
      expiryDate: { $lte: thresholdDate },
    });

    const results = [];

    for (const product of expiringProducts) {
      // Get available inventory for this product
      const availableInventories = await Inventory.find({
        productId: product._id,
        assignedRetailer: null,
        currentStatus: "in_inventory",
      });

      if (availableInventories.length === 0) continue;

      const existingSuggestion = await SuggestedPurchase.findOne({
        productId: product._id,
        status: "pending",
      });

      if (existingSuggestion) {
        console.log(`Skipping ${product.name}, already has a suggestion.`);
        continue;
      }

      // Get best retailer suggestion
      const suggestion = await getSmartRoutingSuggestion(product._id);
      if (!suggestion.suggestedRetailer?.id) continue;

      // Assign each inventory item to suggested retailer
      for (const item of availableInventories) {
        item.assignedRetailer = suggestion.suggestedRetailer.id;
        item.currentStatus = "assigned";
        await item.save();
      }

      results.push({
        product: {
          id: product._id,
          name: product.name,
        },
        assignedTo: suggestion.suggestedRetailer.name,
        itemsAssigned: availableInventories.length,
      });
    }

    res.status(200).json({
      success: true,
      message: "Retailers assigned to expiring products",
      results,
    });
  } catch (error) {
    console.error("Auto-assign error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  assignRetailersToExpiringProducts,
};
