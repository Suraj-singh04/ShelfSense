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

    let qtyToFulfill = quantity;
    for (const item of availableInventory) {
      if (qtyToFulfill <= 0) break;

      const deduct = Math.min(item.quantity, qtyToFulfill);
      item.quantity -= deduct;
      qtyToFulfill -= deduct;

      if (item.quantity === 0) {
        item.currentStatus = "sold";
        item.assignedRetailer = retailerId;
      }

      await item.save();
    }

    if (qtyToFulfill > 0) {
      return res.status(400).json({ error: "Not enough inventory available." });
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
        },
      ],
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
    const purchases = await Purchase.find({})
      .populate("retailerId", "name email") // Optional: populates retailer info
      .sort({ date: -1 }); // Optional: newest purchases first

    const formatted = purchases.map((purchase) => ({
      _id: purchase._id,
      retailerId: purchase.retailerId?._id || purchase.retailerId,
      retailerName: purchase.retailerId?.name || "", // only if populated
      date: purchase.date,
      orders: purchase.orders.map((order) => ({
        productId: order.productId,
        productName: order.productName,
        quantity: order.quantity,
        totalPrice: order.totalPrice,
        _id: order._id,
      })),
    }));

    res.status(200).json({ success: true, purchases: formatted });
  } catch (error) {
    console.error("Error fetching Purchases:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Purchases",
    });
  }
};


module.exports = {
  addPurchase,
  getAllPurchases,
};
