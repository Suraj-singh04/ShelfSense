const Product = require("../database/models/product-model");
const Retailer = require("../database/models/retailer-model");
const Inventory = require("../database/models/inventory-model");
const Purchase = require("../database/models/purchase-model");

const seed = async () => {
  try {
    // Clear collections
    // await Product.deleteMany({});
    // await Retailer.deleteMany({});
    // await Inventory.deleteMany({});
    // await Purchase.deleteMany({});
    // console.log("Cleared existing data");

    // Seed products
    const products = await Product.insertMany([
      {
        name: "Britannia Bread",
        category: "Bakery",
        batches: [
          { batchId: "BRD-001", expiryDate: new Date("2025-07-10") },
          { batchId: "BRD-002", expiryDate: new Date("2025-07-15") },
        ],
      },
      {
        name: "Amul Butter",
        category: "Dairy",
        batches: [{ batchId: "BT-001", expiryDate: new Date("2025-08-01") }],
      },
      {
        name: "Maggie Noodles",
        category: "Instant Food",
        batches: [{ batchId: "MG-001", expiryDate: new Date("2025-09-01") }],
      },
    ]);
    console.log("Seeded products");

    // Seed retailers
    const retailers = await Retailer.insertMany([
      {
        name: "A-One Supermart",
        location: "Downtown",
        salesData: [
          { productId: products[0]._id, unitsSold: 100 },
          { productId: products[1]._id, unitsSold: 80 },
        ],
      },
      {
        name: "Fresh Mart",
        location: "West Side",
        salesData: [
          { productId: products[2]._id, unitsSold: 150 },
          { productId: products[0]._id, unitsSold: 90 },
        ],
      },
    ]);
    console.log("Seeded retailers");

    // Seed inventory
    const inventory = await Inventory.insertMany([
      {
        productId: products[0]._id,
        quantity: 50,
        batchId: "BRD-001",
        expiryDate: new Date("2025-07-10"),
        currentStatus: "in_inventory",
        assignedRetailer: null,
      },
      {
        productId: products[0]._id,
        quantity: 30,
        batchId: "BRD-002",
        expiryDate: new Date("2025-07-15"),
        currentStatus: "in_inventory",
        assignedRetailer: null,
      },
      {
        productId: products[1]._id,
        quantity: 40,
        batchId: "BT-001",
        expiryDate: new Date("2025-08-01"),
        currentStatus: "in_inventory",
        assignedRetailer: null,
      },
    ]);
    console.log("Seeded inventory");

    // Seed purchases
    await Purchase.insertMany([
      {
        productId: products[0]._id,
        retailerId: retailers[0]._id,
        quantity: 20,
        date: new Date("2025-06-01"),
      },
      {
        productId: products[1]._id,
        retailerId: retailers[0]._id,
        quantity: 10,
        date: new Date("2025-06-05"),
      },
      {
        productId: products[0]._id,
        retailerId: retailers[1]._id,
        quantity: 15,
        date: new Date("2025-06-03"),
      },
    ]);
    console.log("Seeded purchases");

    console.log("✅ Seeding complete");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
};
module.exports = seed;
