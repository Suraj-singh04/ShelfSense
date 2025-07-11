const getTopRetailersForProduct = require("./topRetailers");
const Inventory = require("../../database/models/inventory-model");
const Product = require("../../database/models/product-model");
const Retailer = require("../../database/models/retailer-model");
const { createPendingSuggestion } = require("./createSuggestion");

const getSmartRoutingSuggestion = async (productId) => {
  const product = await Product.findById(productId);
  if (!product) {
    return { message: "Product not found." };
  }

  const inventoryItem = await Inventory.findOne({
    productId,
    currentStatus: "in_inventory",
  });

  if (!inventoryItem || inventoryItem.quantity < 1) {
    return { message: "Not enough stock for this product." };
  }

  const topRetailers = await getTopRetailersForProduct(productId);

  if (!topRetailers.length) {
    return {
      message: "No retailer purchase history available for this product.",
    };
  }

  const bestRetailer = topRetailers[0].retailer;

  // full retailer data to get salesData
  const retailerData = await Retailer.findById(bestRetailer._id);

  const salesEntry = retailerData.salesData.find(
    (entry) => entry.productId.toString() === productId.toString()
  );

  let suggestedQuantity = salesEntry ? salesEntry.unitsSold : 1;

  if (suggestedQuantity > inventoryItem.quantity) {
    suggestedQuantity = inventoryItem.quantity;
  }

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
      location: bestRetailer.location,
    },
    reason: "Top buyer based on sales history",
    suggestionId: suggestion._id,
    suggestedQuantity,
    status: "pending",
  };
};

module.exports = getSmartRoutingSuggestion;
