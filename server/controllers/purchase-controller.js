const Purchase = require("../../database/models/purchase-model");
const Retailer = require("../../database/models/retailer-model");

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
      .populate("retailerId", "name email")
      .sort({ date: -1 });

    const formatted = purchases.map((purchase) => ({
      _id: purchase._id,
      retailerId: purchase.retailerId?._id || purchase.retailerId,
      retailerName: purchase.retailerId?.name,
      date: purchase.date,
      orders: purchase.orders.map((order) => ({
        productId: order.productId,
        productName: order.productName,
        quantity: order.quantity,
        totalPrice: order.totalPrice,
        imageUrl: order.imageUrl || null,
        status: order.status,
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

const getAllPurchasesAdmin = async (req, res) => {
  try {
    const purchases = await Purchase.find({})
      .populate("retailerId", "name email")
      .sort({ date: -1 });

    const formatted = purchases.map((purchase) => ({
      _id: purchase._id,
      retailerId: purchase.retailerId?._id || purchase.retailerId,
      retailerName: purchase.retailerId?.name,
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
  // addPurchase,
  getAllPurchasesRetailer,
  getAllPurchasesAdmin,
};
