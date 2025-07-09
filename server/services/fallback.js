const SuggestedPurchase = require("../../database/models/suggestedPurchase-model");
const getTopRetailersForProduct = require("./topRetailers");
const notifyRetailer = require("./notifyRetailer.js");

const fallbackSuggestionHandler = async () => {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hrs ago

  const expiredSuggestions = await SuggestedPurchase.find({
    confirmed: false,
    createdAt: { $lt: cutoff },
  });

  for (const suggestion of expiredSuggestions) {
    const topRetailers = await getTopRetailersForProduct(suggestion.productId);

    // Filter out already tried retailers
    const newRetailer = topRetailers
      .map((r) => r.retailer._id.toString())
      .find((id) => !suggestion.triedRetailers.includes(id));

    if (newRetailer) {
      // Update current suggestion as expired
      suggestion.triedRetailers.push(suggestion.retailerId);
      suggestion.retailerId = newRetailer;
      suggestion.attempts += 1;
      suggestion.createdAt = new Date(); // reset timer
      await suggestion.save();

      notifyRetailer(
        newRetailer,
        `📦 New fallback suggestion: Please confirm purchase of product ${suggestion.productId}`
      );
      console.log(`✅ Fallback: Reassigned to Retailer ${newRetailer}`);
    } else {
      console.log(
        `⚠️ No fallback retailer found for product ${suggestion.productId}`
      );
      // Optional: mark as expired or alert admin
    }
  }
};
