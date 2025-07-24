const Retailer = require("../../database/models/retailer-model");
const Product = require("../../database/models/product-model");
const Inventory = require("../../database/models/inventory-model");
const Purchase = require("../../database/models/purchase-model");

const addSalesData = async (req, res) => {
  try {
    const {
      productId,
      productName,
      unitsSold,
      saleDate,
      batchId,
      priceAtSale,
    } = req.body;

    if (!unitsSold || (!productId && !productName)) {
      return res.status(400).json({
        success: false,
        message: "unitsSold and (productId or productName) are required",
      });
    }

    const userId = req.userInfo?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const retailer = await Retailer.findOne({ userId });
    if (!retailer) {
      return res
        .status(404)
        .json({ success: false, message: "Retailer not found for this user" });
    }

    const product = productId
      ? await Product.findById(productId)
      : await Product.findOne({ name: productName });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const qty = Number(unitsSold);
    if (Number.isNaN(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: "unitsSold must be a positive number",
      });
    }

    const effectivePrice =
      priceAtSale != null ? Number(priceAtSale) : Number(product.price);
    const totalAmount = effectivePrice * qty;

    const event = {
      productId: product._id,
      productName: product.name,
      unitsSold: qty,
      priceAtSale: effectivePrice,
      totalAmount,
      saleDate: saleDate ? new Date(saleDate) : new Date(),
      batchId,
    };

    retailer.salesData.push(event);
    await retailer.save();

    return res.status(201).json({
      success: true,
      message: "Sales data recorded",
      sale: event,
    });
  } catch (err) {
    console.error("Add Sales Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

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

const getRetailerSalesSummary = async (req, res) => {
  try {
    const userId = req.userInfo?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const retailerFromUser = await Retailer.findOne({ userId });
    if (!retailerFromUser) {
      return res
        .status(404)
        .json({ success: false, message: "Retailer not found for this user" });
    }

    const { from, to, productId } = req.query;

    const retailer = await Retailer.findById(retailerFromUser._id, {
      salesData: 1,
    }).lean();
    if (!retailer) {
      return res
        .status(404)
        .json({ success: false, message: "Retailer not found" });
    }

    let sales = retailer.salesData || [];

    if (from) {
      const fromDate = new Date(from);
      sales = sales.filter((s) => new Date(s.saleDate) >= fromDate);
    }
    if (to) {
      const toDate = new Date(to);
      sales = sales.filter((s) => new Date(s.saleDate) <= toDate);
    }
    if (productId) {
      sales = sales.filter((s) => s.productId.toString() === productId);
    }

    const summaryMap = {};
    for (const s of sales) {
      const key = s.productId.toString();
      if (!summaryMap[key]) {
        summaryMap[key] = {
          productId: s.productId,
          productName: s.productName,
          unitPrice: s.priceAtSale,
          unitsSold: 0,
          revenue: 0,
        };
      }
      summaryMap[key].unitsSold += s.unitsSold;
      summaryMap[key].revenue += s.totalAmount || 0;
    }

    return res
      .status(200)
      .json({ success: true, summary: Object.values(summaryMap) });
  } catch (err) {
    console.error("getRetailerSalesSummary error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getRetailerSales = async (req, res) => {
  try {
    const userId = req.userInfo?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const retailerFromUser = await Retailer.findOne({ userId });
    if (!retailerFromUser) {
      return res
        .status(404)
        .json({ success: false, message: "Retailer not found for this user" });
    }

    const retailerId = retailerFromUser._id;
    const { from, to, productId } = req.query;

    const retailer = await Retailer.findById(retailerId, {
      salesData: 1,
    }).lean();
    if (!retailer) {
      return res
        .status(404)
        .json({ success: false, message: "Retailer not found" });
    }

    let sales = retailer.salesData || [];

    if (from) {
      const fromDate = new Date(from);
      sales = sales.filter((s) => new Date(s.saleDate) >= fromDate);
    }
    if (to) {
      const toDate = new Date(to);
      sales = sales.filter((s) => new Date(s.saleDate) <= toDate);
    }
    if (productId) {
      sales = sales.filter((s) => s.productId.toString() === productId);
    }

    return res.status(200).json({ success: true, sales });
  } catch (err) {
    console.error("getRetailerSales error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  addSalesData,
  getAvailableProducts,
  getRetailerOrders,
  getAllRetailers,
  getRetailersWithStats,
  getRetailerSales,
  getRetailerSalesSummary,
};
