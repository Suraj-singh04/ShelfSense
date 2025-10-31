const Inventory = require("../../database/models/inventory-model");
const Product = require("../../database/models/product-model");
const SuggestedPurchase = require("../../database/models/suggested-purchase-model");

const assignRetailersToExpiringProducts = async (req, res) => {
  try {
    const thresholdDays = 10;
    const thresholdDate = new Date(
      Date.now() + thresholdDays * 24 * 60 * 60 * 1000
    );

    // Find inventory expiring soon
    const expiringInventories = await Inventory.find({
      currentStatus: "in_inventory",
      expiryDate: { $lte: thresholdDate },
      quantity: { $gt: 0 },
    }).populate("productId");

    const results = [];

    for (const item of expiringInventories) {
      const product = item.productId;
      if (!product) continue;

      // Skip if a suggestion already exists
      const existingSuggestion = await SuggestedPurchase.findOne({
        productId: product._id,
        inventoryId: item._id,
        status: "pending",
      });
      if (existingSuggestion) {
        console.log(`Skipping ${product.name}, already has a suggestion.`);
        continue;
      }

      // ✅ Since smartRoutingSuggestion is gone, we directly create a SuggestedPurchase.
      // You may later enhance this by picking a retailer from your Retailer model.
      await SuggestedPurchase.create({
        productId: product._id,
        inventoryId: item._id,
        // placeholder retailer — can be chosen by your own logic
        retailerId: null,
        quantity: item.quantity,
        status: "pending",
        suggestedAt: new Date(),
      });

      results.push({
        product: { id: product._id, name: product.name },
        assignedTo: "Unassigned (manual assignment required)",
        itemsAssigned: item.quantity,
      });
    }

    res.status(200).json({
      success: true,
      message: "Retailer suggestions created for expiring products",
      results,
    });
  } catch (error) {
    console.error("Auto-assign error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { assignRetailersToExpiringProducts };
