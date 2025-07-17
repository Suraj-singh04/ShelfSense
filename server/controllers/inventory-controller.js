const Inventory = require("../../database/models/inventory-model");
const Product = require("../../database/models/product-model");

const addToInventory = async (req, res) => {
  try {
    const { productId, quantity, batchId, expiryDate } = req.body;

    if (!productId || !quantity || !batchId) {
      return res.status(400).json({
        error: "Missing required fields: productId, quantity, or batchId",
      });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    let expiryToUse;

    const existingBatch = product.batches.find(
      (b) => b.batchId === batchId.trim()
    );

    if (existingBatch) {
      expiryToUse = existingBatch.expiryDate;
    } else {
      if (!expiryDate) {
        return res
          .status(400)
          .json({ error: "Expiry date is required for new batch" });
      }
      product.batches.push({ batchId: batchId.trim(), expiryDate });
      await product.save();
      expiryToUse = expiryDate;
    }

    const inventoryItem = await Inventory.create({
      productId,
      quantity,
      batchId: batchId.trim(),
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

const getAllInventoryItems = async (req, res) => {
  try {
    const inventory = await Inventory.find({
      currentStatus: "in_inventory",
    }).populate("productId");

    const grouped = {};

    inventory.forEach((item) => {
      const id = item.productId._id.toString();

      if (!grouped[id]) {
        grouped[id] = {
          _id: id,
          name: item.productId.name,
          totalQuantity: 0,
          batches: [],
        };
      }

      grouped[id].totalQuantity += item.quantity;
      grouped[id].batches.push({
        quantity: item.quantity,
        expiry: item.expiryDate,
        batchId: item.batchId,
      });
    });

    res.status(200).json({
      success: true,
      products: Object.values(grouped),
    });
  } catch (err) {
    console.error("Error getting inventory:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch inventory" });
  }
};

module.exports = {
  addToInventory,
  getAllInventoryItems,
};
