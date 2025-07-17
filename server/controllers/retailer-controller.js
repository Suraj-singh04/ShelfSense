const Retailer = require("../../database/models/retailer-model");
const Product = require("../../database/models/product-model");
const Inventory = require("../../database/models/inventory-model");
const Purchase = require("../../database/models/purchase-model");

// const addRetailer = async (req, res) => {
//   try {
//     const { name, location, salesData } = req.body;

//     if (!name || !location) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     if (!Array.isArray(salesData)) {
//       return res.status(400).json({ error: "Sales data must be an array" });
//     }

//     const newRetailer = await Retailer.create({
//       name,
//       location,
//       salesData,
//     });
//     res.status(201).json({ message: "Retailer created", data: newRetailer });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

const addSalesData = async (req, res) => {
  try {
    const { retailerId, productName, unitsSold } = req.body;
    // const retailerId = req.userInfo.userId;

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

const getAvailableProducts = async (req, res) => {
  try {
    // Find all unassigned inventory
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

    const availableProducts = Object.values(productMap);

    res.status(200).json({ success: true, data: availableProducts });
  } catch (error) {
    console.error("Error fetching available products:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const placeOrder = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const retailerId = req.userInfo.userId;

    if (!retailerId || !productId || !quantity || quantity < 1) {
      return res.status(400).json({
        message: "All fields are required and quantity must be positive.",
      });
    }

    const inventoryItems = await Inventory.find({
      productId,
      assignedRetailer: null,
      currentStatus: "in_inventory",
      quantity: { $gt: 0 },
    }).sort({ expiryDate: 1 });

    let qtyLeft = quantity;
    const allocations = [];

    for (const item of inventoryItems) {
      if (qtyLeft <= 0) break;

      const takeQty = Math.min(qtyLeft, item.quantity);
      allocations.push({ batchId: item.batchId, quantity: takeQty });

      item.quantity -= takeQty;

      if (item.quantity === 0) {
        item.assignedRetailer = retailerId;
        item.currentStatus = "assigned";
      }

      await item.save();
      qtyLeft -= takeQty;
    }

    if (qtyLeft > 0) {
      return res.status(400).json({
        message: `Not enough inventory. Requested: ${quantity}, Available: ${
          quantity - qtyLeft
        }`,
        allocations,
      });
    }

    await Purchase.create({
      retailerId,
      productId,
      quantity,
    });

    res.status(200).json({
      message: "Order placed successfully",
      allocated: allocations,
    });
  } catch (err) {
    console.error("Manual order error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getRetailerOrders = async (req, res) => {
  try {
    const retailerId = req.userInfo.userId;

    const orders = await Purchase.find({ retailerId }).sort({ createdAt: -1 });

    const result = [];

    for (const order of orders) {
      const product = await Product.findById(order.productId);
      result.push({
        productName: product?.name || "Unknown",
        quantity: order.quantity,
        purchasedAt: order.createdAt,
      });
    }

    res.status(200).json({ success: true, orders: result });
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
      .json({ success: false, message: "Failed to fetch retaiers" });
  }
};

module.exports = {
  // addRetailer,
  addSalesData,
  getAvailableProducts,
  placeOrder,
  getRetailerOrders,
  getAllRetailers,
};
