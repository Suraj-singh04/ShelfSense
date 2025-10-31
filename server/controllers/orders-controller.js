const Order = require("../../database/models/order-pay-model");

async function getBySessionId(req, res) {
  try {
    const { sessionId } = req.params;
    const order = await Order.findOne({ stripeSessionId: sessionId }).lean();
    if (!order) return res.status(404).json({ message: "Order not found yet" });
    res.json(order);
  } catch (err) {
    console.error("❌ getBySessionId error:", err);
    res.status(500).json({ message: "Failed to fetch order" });
  }
}

async function getById(req, res) {
  try {
    const { orderId } = req.params;
    console.log("Fetching order with ID:", orderId);
    const order = await Order.findById(orderId).lean();
    console.log("Fetched order:", order);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    console.error("❌ getById error:", err);
    res.status(500).json({ message: "Failed to fetch order" });
  }
}

const getLatestOrderByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const latestOrder = await Order.findOne({ "items.productId": productId })
      .sort({ createdAt: -1 })
      .lean();
    console.log(latestOrder);
    if (!latestOrder) {
      return res.status(404).json({
        success: false,
        message: "No order found for this product.",
      });
    }

    res.json({ success: true, order: latestOrder });
  } catch (error) {
    console.error("Error fetching latest order:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { getById, getBySessionId, getLatestOrderByProduct };
