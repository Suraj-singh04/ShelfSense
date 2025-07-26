const Inventory = require("../../database/models/inventory-model");
const Product = require("../../database/models/product-model");
const Retailer = require("../../database/models/retailer-model");
const getTopRetailersForProduct = require("./topRetailers");
const { createPendingSuggestion } = require("./createSuggestion");

const refreshSmartSuggestion = async (productId, inventoryId = null) => {
  try {
    const product = await Product.findById(productId);
    if (!product) {
      console.log(`[REFRESH] Product not found: ${productId}`);
      return null;
    }

    const inventoryQuery = {
      productId,
      currentStatus: "in_inventory",
      quantity: { $gt: 0 },
    };
    if (inventoryId) inventoryQuery._id = inventoryId;

    const inventoryItem = await Inventory.findOne(inventoryQuery);
    if (!inventoryItem) {
      console.log(
        `[REFRESH] No inventory available for product ${productId} (or quantity = 0)`
      );
      return null;
    }

    const topRetailers = await getTopRetailersForProduct(productId);
    if (!topRetailers.length) {
      console.log(
        `[REFRESH] No retailer with sales history for product ${productId}`
      );
      return null;
    }

    const bestRetailer = topRetailers[0].retailer;
    const retailerData = await Retailer.findById(bestRetailer._id);

    const totalUnitsSold = retailerData.salesData
      .filter((e) => e.productId.toString() === productId.toString())
      .reduce((acc, e) => acc + e.unitsSold, 0);

    let suggestedQuantity = Math.max(totalUnitsSold, 1);
    suggestedQuantity = Math.min(suggestedQuantity, inventoryItem.quantity);

    await createPendingSuggestion(
      product,
      bestRetailer._id,
      inventoryItem,
      suggestedQuantity
    );

    return true;
  } catch (err) {
    console.error(
      `[REFRESH] Error refreshing suggestion for ${productId}:`,
      err
    );
    return null;
  }
};

module.exports = refreshSmartSuggestion;
