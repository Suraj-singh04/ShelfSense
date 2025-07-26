// scheduler/index.js
const cron = require("node-cron");
const {
  generateSuggestionsForExpiringProducts,
} = require("../server/services/generateSuggestions");

function runSmartRoutingScheduler() {
  cron.schedule("*/15 * * * *", async () => {
    console.log("[SmartRouting] tick: generating suggestions…");
    try {
      await generateSuggestionsForExpiringProducts();
      console.log("[SmartRouting] done.");
    } catch (e) {
      console.error("[SmartRouting] failed:", e);
    }
  });
}

module.exports = runSmartRoutingScheduler;
