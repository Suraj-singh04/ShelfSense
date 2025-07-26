const getTopRetailersForProduct = require("./topRetailers");
const Inventory = require("../../database/models/inventory-model");
const Product = require("../../database/models/product-model");
const Retailer = require("../../database/models/retailer-model");
const { createPendingSuggestion } = require("./createSuggestion");

const getSmartRoutingSuggestion = async (productId) => {
  const product = await Product.findById(productId);
  if (!product) return { message: "Product not found." };

  const inventoryItem = await Inventory.findOne({
    productId,
    currentStatus: "in_inventory",
    quantity: { $gt: 0 },
  });
  if (!inventoryItem) return { message: "Not enough stock for this product." };

  const topRetailers = await getTopRetailersForProduct(productId);

  // *** If nobody has sold this product, do not suggest it ***
  if (!topRetailers.length) {
    return {
      message:
        "No retailer has sales history for this product. Skipping suggestion.",
    };
  }

  const bestRetailer = topRetailers[0].retailer;
  const retailerData = await Retailer.findById(bestRetailer._id);

  const totalUnitsSold = retailerData.salesData
    .filter((e) => e.productId.toString() === productId.toString())
    .reduce((acc, e) => acc + e.unitsSold, 0);

  // use sold quantity (or any smarter heuristic you want)
  let suggestedQuantity = Math.max(totalUnitsSold, 1);
  suggestedQuantity = Math.min(suggestedQuantity, inventoryItem.quantity);

  const suggestion = await createPendingSuggestion(
    product,
    bestRetailer._id,
    inventoryItem,
    suggestedQuantity
  );

  return {
    productId,
    suggestedRetailer: {
      id: bestRetailer._id,
      name: bestRetailer.name,
    },
    reason: "Top buyer with existing sales history",
    suggestionId: suggestion._id,
    suggestedQuantity,
    status: suggestion.status,
  };
};

module.exports = getSmartRoutingSuggestion;
