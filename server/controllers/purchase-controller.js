const Purchase = require("../../database/models/purchase-model");
const Inventory = require("../../database/models/inventory-model");
const Retailer = require("../../database/models/retailer-model");
const Product = require("../../database/models/product-model");

const addPurchase = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const retailerId = req.userInfo?.userId;

    if (!retailerId || !productId || !quantity) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const retailer = await Retailer.find({
      retailerId,
    });
    const retailerName = retailer.retailerName;

    const product = await Product.find({ productId });
    const productName = product.productName;
    // STEP 1: Find the available inventory items for the product
    const availableInventory = await Inventory.find({
      productId,
      currentStatus: "in_inventory",
      assignedRetailer: null,
    }).sort({ expiryDate: 1 }); // optional: prioritize older stock

    let qtyToFulfill = quantity;

    for (const item of availableInventory) {
      if (qtyToFulfill <= 0) break;

      const deduct = Math.min(item.quantity, qtyToFulfill);
      item.quantity -= deduct;
      qtyToFulfill -= deduct;

      if (item.quantity === 0) {
        item.currentStatus = "sold";
      }

      if (item.quantity === 0) {
        item.currentStatus = "sold";
        item.assignedRetailer = retailerId;
      }

      await item.save();
    }

    if (qtyToFulfill > 0) {
      return res.status(400).json({ error: "Not enough inventory available." });
    }

    // STEP 2: Record the purchase
    const purchase = new Purchase({
      retailerName,
      retailerId,
      productName,
      productId,
      quantity,
    });

    await purchase.save();

    return res.status(201).json({ message: "Purchase recorded", purchase });
  } catch (error) {
    console.error("Error adding purchase:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getAllPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find({});
    res.status(200).json({ success: true, purchases });
  } catch (error) {
    console.error("Error fetching Purchases:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch Purchases" });
  }
};

module.exports = {
  addPurchase,
  getAllPurchases,
};
