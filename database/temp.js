const Inventory = require("./models/inventory-model");
const Product = require("./models/product-model");
const Retailer = require("./models/retailer-model");
const Purchase = require("./models/purchase-model");

const clearAllData = async () => {
  try {
    await Inventory.deleteMany({});
    await Product.deleteMany({});
    await Retailer.deleteMany({});
    await Purchase.deleteMany({});

    console.log("✅ All collections cleared!");
    process.exit(); 
  } catch (err) {
    console.error("Error clearing collections:", err);
  }
};

module.exports = clearAllData;
