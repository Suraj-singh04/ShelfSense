const Purchase = require("../../database/models/purchase-model");
const Inventory = require("../../database/models/inventory-model");
const Retailer = require("../../database/models/retailer-model");
const Product = require("../../database/models/product-model");

const addPurchase = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const userId = req.userInfo?.userId;
    const retailer = await Retailer.findOne({ userId });
    if (!retailer) {
      return res.status(404).json({ error: "Retailer not found." });
    }

    const retailerId = retailer._id;
    if (!productId || !quantity) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    const availableInventory = await Inventory.find({
      productId,
      currentStatus: "in_inventory",
      assignedRetailer: null,
    }).sort({ expiryDate: 1 });

    const totalAvailable = availableInventory.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    if (totalAvailable < quantity) {
      return res.status(400).json({
        error: `Not enough inventory available. Only ${totalAvailable} units available, but ${quantity} requested.`,
      });
    }

    let qtyToFulfill = quantity;
    for (const item of availableInventory) {
      if (qtyToFulfill <= 0) break;

      const deduct = Math.min(item.quantity, qtyToFulfill);
      item.quantity -= deduct;

      if (item.quantity === 0) {
        item.currentStatus = "sold";
      }
      await item.save();

      qtyToFulfill -= deduct;
    }

    const totalPrice = quantity * product.price;

    const purchase = new Purchase({
      retailerId,
      retailerName: retailer.retailerName,
      orders: [
        {
          productId,
          productName: product.name,
          quantity,
          totalPrice,
          imageUrl: product.imageUrl,
          status: "completed",
        },
      ],
    });

    await purchase.save();

    console.log(`✅ Purchase completed for retailer ${retailer.retailerName}:`);
    console.log(`   - Product: ${product.name}`);
    console.log(`   - Quantity: ${quantity}`);
    console.log(`   - Deducted from inventory only`);

    return res.status(201).json({ message: "Purchase recorded", purchase });
  } catch (error) {
    console.error("Error adding purchase:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Retailer-specific
const getAllPurchasesRetailer = async (req, res) => {
  try {
    const userId = req.userInfo?.userId;
    const retailer = await Retailer.findOne({ userId });

    if (!retailer) {
      return res
        .status(404)
        .json({ success: false, message: "Retailer not found" });
    }

    const purchases = await Purchase.find({ retailerId: retailer._id })
      .populate("retailerId", "retailerName email")
      .sort({ date: -1 });

    const formatted = purchases.map((purchase) => ({
      _id: purchase._id,
      retailerId: purchase.retailerId?._id || purchase.retailerId,
      retailerName:
        purchase.retailerName || purchase.retailerId?.retailerName || "",
      date: purchase.date,
      orders: purchase.orders.map((order) => ({
        productId: order.productId,
        productName: order.productName,
        quantity: order.quantity,
        totalPrice: order.totalPrice,
        imageUrl: order.imageUrl || null,
        _id: order._id,
      })),
    }));

    res.status(200).json({ success: true, purchases: formatted });
  } catch (error) {
    console.error("Error fetching Retailer Purchases:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch Purchases" });
  }
};

// ✅ Admin-specific
const getAllPurchasesAdmin = async (req, res) => {
  try {
    const purchases = await Purchase.find({})
      .populate("retailerId", "retailerName email")
      .sort({ date: -1 });

    const formatted = purchases.map((purchase) => ({
      _id: purchase._id,
      retailerId: purchase.retailerId?._id || purchase.retailerId,
      retailerName:
        purchase.retailerName || purchase.retailerId?.retailerName || "",
      date: purchase.date,
      orders: purchase.orders.map((order) => ({
        productId: order.productId,
        productName: order.productName,
        quantity: order.quantity,
        totalPrice: order.totalPrice,
        imageUrl: order.imageUrl || null,
        _id: order._id,
      })),
    }));

    res.status(200).json({ success: true, purchases: formatted });
  } catch (error) {
    console.error("Error fetching Admin Purchases:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch Purchases" });
  }
};

module.exports = {
  addPurchase,
  getAllPurchasesRetailer,
  getAllPurchasesAdmin,
};

module.exports = {
  addPurchase,
  getAllPurchasesRetailer,
  getAllPurchasesAdmin,
};
