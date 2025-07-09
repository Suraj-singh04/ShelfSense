const cron = require("node-cron");
const Product = require("../database/models/product-model");
const getSmartRoutingSuggestion = require("./services/smartRoutingSuggestion");
const SuggestedPurchase = require("../database/models/suggested-purchase-model");

const runSmartRoutingScheduler = async () => {
  try {
    const thresholdDays = 10;
    const thresholdDate = new Date(
      Date.now() + thresholdDays * 24 * 60 * 60 * 1000
    );

    const expiringProducts = await Product.find({
      expiryDate: { $lte: thresholdDate },
    });

    for (const product of expiringProducts) {
      const existingSuggestion = await SuggestedPurchase.findOne({
        productId: product._id,
        confirmed: false,
      });

      if (existingSuggestion) {
        console.log(
          `⏩ Skipping ${product.name}: already has a pending suggestion.`
        );
        continue;
      }

      const suggestion = await getSmartRoutingSuggestion(product._id);

      if (suggestion && suggestion.suggestionId) {
        console.log(
          `✅ New suggestion created for ${product.name}:`,
          suggestion
        );
      } else {
        console.log(
          `⚠️ Could not create suggestion for ${product.name}:`,
          suggestion.message
        );
      }
    }
  } catch (err) {
    console.error("🛑 Scheduler Error:", err.message);
  }
};

// Schedule to run every 2 days at midnight
cron.schedule("0 0 */2 * *", () => {
  console.log("🔄 Running Smart Routing Scheduler...");
  runSmartRoutingScheduler();
});

module.exports = runSmartRoutingScheduler;
