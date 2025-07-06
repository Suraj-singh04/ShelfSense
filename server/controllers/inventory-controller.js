const Inventory = require("../../database/models/inventory-model");
const Product = require("../../database/models/product-model");

const addToInventory = async (req, res) => {
  try {
    const { productName, quantity, batchId, expiryDate } = req.body;

    // Validation
    if (!productName || !quantity || !batchId) {
      return res.status(400).json({
        error: "Missing required fields: productName, quantity, or batchId",
      });
    }

    const product = await Product.findOne({ name: productName });
    if (!product) return res.status(404).json({ error: "Product not found" });

    let expiryToUse;

    const existingBatch = product.batches.find((b) => b.batchId === batchId);

    if (existingBatch) {
      expiryToUse = existingBatch.expiryDate;
    } else {
      if (!expiryDate) {
        return res
          .status(400)
          .json({ error: "Expiry date is required for new batch" });
      }
      product.batches.push({ batchId, expiryDate });
      await product.save();
      expiryToUse = expiryDate;
    }

    const inventoryItem = await Inventory.create({
      productId: product._id,
      quantity,
      batchId,
      expiryDate: expiryToUse,
      currentStatus: "in_inventory",
      assignedRetailer: null,
    });

    return res.status(201).json({
      message: "Inventory added successfully",
      data: inventoryItem,
    });
  } catch (err) {
    console.error("Inventory Add Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Inventory.find().sort({ expiryDate: 1 });
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch products" });
  }
};

module.exports = {
  addToInventory,
  getAllProducts,
};
