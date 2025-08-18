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

    // Check if retailer has enough inventory for this product
    const retailerInventory = await Inventory.find({
      productId: product._id,
      assignedRetailer: retailer._id,
      currentStatus: { $in: ["assigned", "in_inventory"] },
      quantity: { $gt: 0 },
    }).sort({ expiryDate: 1 });

    const totalAvailableQuantity = retailerInventory.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    if (totalAvailableQuantity < qty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient inventory. You have ${totalAvailableQuantity} units available, but trying to sell ${qty} units. Please purchase more inventory first.`,
        availableQuantity: totalAvailableQuantity,
        requestedQuantity: qty,
        productName: product.name,
      });
    }

    // Deduct from inventory (FIFO - First In, First Out)
    let remainingQtyToDeduct = qty;
    const updatedInventoryItems = [];

    for (const item of retailerInventory) {
      if (remainingQtyToDeduct <= 0) break;

      const deductAmount = Math.min(item.quantity, remainingQtyToDeduct);
      item.quantity -= deductAmount;
      remainingQtyToDeduct -= deductAmount;

      if (item.quantity === 0) {
        item.currentStatus = "sold";
      }

      updatedInventoryItems.push(item.save());
    }

    // Save all inventory updates
    await Promise.all(updatedInventoryItems);

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
      inventoryUpdated: true,
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

const getRetailerInventory = async (req, res) => {
  try {
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

    console.log(`🔍 Looking for inventory for retailer: ${retailer.retailerName} (ID: ${retailer._id})`);

    const retailerInventory = await Inventory.find({
      assignedRetailer: retailer._id,
      currentStatus: { $in: ["assigned", "in_inventory"] },
      quantity: { $gt: 0 },
    }).populate("productId");

    console.log(`📦 Found ${retailerInventory.length} inventory items for retailer`);

    const inventorySummary = {};
    
    for (const item of retailerInventory) {
      const productId = item.productId._id.toString();
      
      if (!inventorySummary[productId]) {
        inventorySummary[productId] = {
          productId: item.productId._id,
          productName: item.productId.name,
          totalQuantity: 0,
          batches: [],
        };
      }
      
      inventorySummary[productId].totalQuantity += item.quantity;
      inventorySummary[productId].batches.push({
        batchId: item.batchId,
        quantity: item.quantity,
        expiryDate: item.expiryDate,
        status: item.currentStatus,
      });
    }

    console.log(`📊 Inventory summary:`, Object.keys(inventorySummary).map(key => ({
      product: inventorySummary[key].productName,
      quantity: inventorySummary[key].totalQuantity
    })));

    return res.status(200).json({
      success: true,
      inventory: Object.values(inventorySummary),
    });
  } catch (err) {
    console.error("getRetailerInventory error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const fixInventoryAssignments = async (req, res) => {
  try {
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

    console.log(`🔧 Fixing inventory assignments for retailer: ${retailer.retailerName}`);

    // Get all purchases for this retailer
    const purchases = await Purchase.find({ retailerId: retailer._id });
    console.log(`📋 Found ${purchases.length} purchases for retailer`);

    let fixedCount = 0;
    const results = [];

    for (const purchase of purchases) {
      for (const order of purchase.orders) {
        const product = await Product.findById(order.productId);
        if (!product) continue;

        // Check if retailer already has inventory for this product
        const existingInventory = await Inventory.find({
          productId: order.productId,
          assignedRetailer: retailer._id,
          currentStatus: { $in: ["assigned", "in_inventory"] },
        });

        const totalExistingQuantity = existingInventory.reduce((sum, item) => sum + item.quantity, 0);

        if (totalExistingQuantity < order.quantity) {
          // Need to create additional inventory
          const neededQuantity = order.quantity - totalExistingQuantity;
          
          // Find available unassigned inventory
          const availableInventory = await Inventory.find({
            productId: order.productId,
            currentStatus: "in_inventory",
            assignedRetailer: null,
            quantity: { $gt: 0 },
          }).sort({ expiryDate: 1 });

          let qtyToAssign = neededQuantity;
          for (const item of availableInventory) {
            if (qtyToAssign <= 0) break;

            const assignAmount = Math.min(item.quantity, qtyToAssign);
            
            // Reduce the original inventory
            item.quantity -= assignAmount;
            if (item.quantity === 0) {
              item.currentStatus = "sold";
            }
            await item.save();

            // Create new inventory for retailer
            const newInventoryItem = new Inventory({
              productId: item.productId,
              batchId: item.batchId,
              price: item.price,
              quantity: assignAmount,
              expiryDate: item.expiryDate,
              currentStatus: "assigned",
              assignedRetailer: retailer._id,
              imageUrl: item.imageUrl,
            });
            
            await newInventoryItem.save();
            qtyToAssign -= assignAmount;
            fixedCount++;
          }

          results.push({
            product: product.name,
            requested: order.quantity,
            existing: totalExistingQuantity,
            fixed: neededQuantity - qtyToAssign,
          });
        }
      }
    }

    console.log(`✅ Fixed ${fixedCount} inventory items for retailer`);

    return res.status(200).json({
      success: true,
      message: `Fixed ${fixedCount} inventory assignments`,
      results,
    });
  } catch (err) {
    console.error("fixInventoryAssignments error:", err);
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
  getRetailerInventory,
  fixInventoryAssignments,
};
