const Inventory = require("./models/inventory-model");
const Product = require("./models/product-model");
const Retailer = require("./models/retailer-model");
const Purchase = require("./models/purchase-model");
const suggestedPurchaseModel = require("./models/suggested-purchase-model");
const registerModel = require("./models/register-model");

const clearAllData = async () => {
  try {
    await Inventory.deleteMany({});
    await Product.deleteMany({});
    await Retailer.deleteMany({});
    await Purchase.deleteMany({});
    await suggestedPurchaseModel.deleteMany({});
    // await registerModel.deleteMany({});
    // await Inventory.deleteMany({ productId: null });

    console.log("✅ All collections cleared!");
    process.exit();
  } catch (err) {
    console.error("Error clearing collections:", err);
  }
};

module.exports = clearAllData;
