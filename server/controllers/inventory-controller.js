const Inventory = require("../../database/models/inventory-model");
const Product = require("../../database/models/product-model");

const addToInventory = async (req, res) => {
  try {
    const { productName, quantity, expiryDate } = req.body;

    if (!productName || !quantity || !expiryDate) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const product = await Product.findOne({ name: productName });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const inventoryItem = await Inventory.create({
      productId: product._id,
      quantity,
      expiryDate,
      currentStatus: "in_inventory",
      assignedRetailer: null,
    });

    res.status(201).json({
      message: "Inventory added successfully",
      data: inventoryItem,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = addToInventory;
