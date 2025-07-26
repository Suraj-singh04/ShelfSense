const SuggestedPurchase = require("../../database/models/suggested-purchase-model");

const createPendingSuggestion = async (
  product,
  retailerId,
  inventoryItem,
  quantity
) => {
  const existing = await SuggestedPurchase.findOne({
    productId: product._id,
    inventoryId: inventoryItem._id,
    status: { $in: ["pending", "reassigned"] },
  });

  if (existing) {
    let changed = false;

    if (existing.retailerId.toString() !== retailerId.toString()) {
      if (
        !existing.triedRetailers.some(
          (r) => r.toString() === existing.retailerId.toString()
        )
      ) {
        existing.triedRetailers.push(existing.retailerId);
      }
      existing.retailerId = retailerId;
      existing.status = "reassigned";
      existing.attempts = (existing.attempts || 1) + 1;
      changed = true;
    }

    if (existing.quantity !== quantity) {
      existing.quantity = quantity;
      changed = true;
    }

    if (changed) {
      existing.createdAt = new Date();
      await existing.save();
      console.log(
        `🔄 Suggestion updated: product=${product._id} retailer=${retailerId} qty=${quantity}`
      );
    } else {
      console.log(
        `ℹ️ Suggestion unchanged (already optimal): product=${product._id} retailer=${retailerId} qty=${quantity}`
      );
    }

    return existing;
  }

  const newSuggestion = await SuggestedPurchase.create({
    productId: product._id,
    retailerId,
    inventoryId: inventoryItem._id,
    quantity,
  });

  console.log(
    `🔔 Suggestion created: product=${product._id} retailer=${retailerId} qty=${quantity}`
  );

  return newSuggestion;
};

module.exports = {
  createPendingSuggestion,
};
