// /api/services/suggestionService.js
const SuggestedPurchase = require("../../database/models/suggested-purchase-model");

const createPendingSuggestion = async (
  product,
  retailerId,
  inventoryItem,
  quantity
) => {
  const existing = await SuggestedPurchase.findOne({
    productId: product._id,
    retailerId,
    inventoryId: inventoryItem._id,
    confirmed: false,
  });

  if (existing) {
    return existing;
  }

  const newSuggestion = await SuggestedPurchase.create({
    productId: product._id,
    retailerId,
    inventoryId: inventoryItem._id,
    quantity,
  });

  console.log(
    `🔔 Suggestion Created: Notify Retailer (${retailerId}) to confirm purchase of ${quantity} units for product ${productId}.`
  );

  return newSuggestion;
};

module.exports = {
  createPendingSuggestion,
};
