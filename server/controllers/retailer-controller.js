const Retailer = require("../../database/models/retailer-model");
const Product = require("../../database/models/product-model");
const Inventory = require("../../database/models/inventory-model");
const Purchase = require("../../database/models/purchase-model");

// Record sales data for a retailer (for analytics or reports)
const addSalesData = async (req, res) => {
  try {
    const { retailerId, productName, unitsSold } = req.body;

    if (!productName || !unitsSold) {
      return res
        .status(400)
        .json({ message: "Product and unitsSold required" });
    }

    const product = await Product.findOne({ name: productName });
    if (!product) return res.status(404).json({ message: "Product not found" });

    const retailer = await Retailer.findById(retailerId);
    if (!retailer)
      return res.status(404).json({ message: "Retailer not found" });

    const existing = retailer.salesData.find(
      (s) => s.productId.toString() === product._id.toString()
    );

    if (existing) {
      existing.unitsSold += unitsSold;
    } else {
      retailer.salesData.push({ productId: product._id, unitsSold });
    }

    await retailer.save();
    res.status(200).json({ success: true, message: "Sales data recorded" });
  } catch (err) {
    console.error("Add Sales Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// View all available inventory (grouped by product)
const getAvailableProducts = async (req, res) => {
  try {
    const inventory = await Inventory.find({
      currentStatus: "in_inventory",
      assignedRetailer: null,
      quantity: { $gt: 0 },
    });

    const productMap = {};

    for (const item of inventory) {
      const productId = item.productId.toString();

      if (!productMap[productId]) {
        const product = await Product.findById(productId);
        if (!product) continue;

        productMap[productId] = {
          productId: product._id,
          productName: product.name,
          totalAvailable: 0,
          batches: [],
        };
      }

      productMap[productId].totalAvailable += item.quantity;
      productMap[productId].batches.push({
        batchId: item.batchId,
        quantity: item.quantity,
        expiryDate: item.expiryDate,
      });
    }

    res.status(200).json({
      success: true,
      data: Object.values(productMap),
    });
  } catch (error) {
    console.error("Error fetching available products:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all orders/purchases for a specific retailer (based on new schema)
const getRetailerOrders = async (req, res) => {
  try {
    const userId = req.userInfo?.userId;
    const retailer = await Retailer.findOne({ userId });
    const retailerId = retailer._id;

    const purchases = await Purchase.find({ retailerId }).sort({ date: -1 });

    const formattedOrders = [];

    for (const purchase of purchases) {
      for (const order of purchase.orders) {
        formattedOrders.push({
          productName: order.productName,
          quantity: order.quantity,
          totalPrice: order.totalPrice,
          purchasedAt: purchase.date,
        });
      }
    }

    res.status(200).json({ success: true, orders: formattedOrders });
  } catch (err) {
    console.error("Fetch orders error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch all retailers (for admin or overview)
const getAllRetailers = async (req, res) => {
  try {
    const retailers = await Retailer.find({});
    res.status(200).json({ success: true, retailers });
  } catch (error) {
    console.error("Error fetching retailers:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch retailers" });
  }
};

const getRetailersWithStats = async (req, res) => {
  try {
    const retailers = await Retailer.find({});
    const purchases = await Purchase.find({});

    const retailerStats = {};

    purchases.forEach((purchase) => {
      const rid = purchase.retailerId?.toString();
      if (!rid) return;

      if (!retailerStats[rid]) {
        retailerStats[rid] = {
          totalOrders: 0,
          totalSpent: 0,
        };
      }

      retailerStats[rid].totalOrders += purchase.orders.length;

      purchase.orders.forEach((order) => {
        retailerStats[rid].totalSpent += order.totalPrice || 0;
      });
    });

    const enrichedRetailers = retailers.map((ret) => {
      const stats = retailerStats[ret._id.toString()] || {
        totalOrders: 0,
        totalSpent: 0,
      };

      return {
        _id: ret._id,
        name: ret.retailerName || ret.name,
        email: ret.email,
        mobileNumber: ret.mobileNumber || "N/A",
        address: ret.address || "N/A",
        totalOrders: stats.totalOrders,
        totalSpent: stats.totalSpent,
      };
    });

    res.status(200).json({ success: true, retailers: enrichedRetailers });
  } catch (err) {
    console.error("❌ Error getting retailer stats:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  addSalesData,
  getAvailableProducts,
  getRetailerOrders,
  getAllRetailers,
  getRetailersWithStats,
};
