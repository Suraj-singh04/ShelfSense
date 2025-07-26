const Inventory = require("../../database/models/inventory-model");
const refreshSmartSuggestion = require("./refreshSmartSuggestion");
const getSmartRoutingSuggestion = require("./smartRoutingSuggestion");

async function generateSuggestionsForExpiringProducts() {
  const thresholdDays = 60;
  const thresholdDate = new Date(
    Date.now() + thresholdDays * 24 * 60 * 60 * 1000
  );

  const expiringInventory = await Inventory.find({
    expiryDate: { $lte: thresholdDate },
    currentStatus: "in_inventory",
    quantity: { $gt: 0 },
  });

  let createdOrUpdated = 0;

  for (const inv of expiringInventory) {
    const ok = await refreshSmartSuggestion(inv.productId, inv._id);
    if (ok) createdOrUpdated++;
  }

  console.log(
    `[SmartRouting] Suggestions created/updated: ${createdOrUpdated}`
  );

  for (const inv of expiringInventory) {
    const suggestion = await getSmartRoutingSuggestion(inv.productId);
    if (suggestion.message?.startsWith("No retailer has sales history"))
      continue;
  }
}

module.exports = { generateSuggestionsForExpiringProducts };
