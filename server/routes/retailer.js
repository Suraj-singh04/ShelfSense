const express = require("express");
const router = express.Router();
const {
  // addRetailer,
  addSalesData,
  getAvailableProducts,
  placeOrder,
  getRetailerOrders,
} = require("../controllers/retailer-controller");
const authMiddleware = require("../middleware/auth-middleware");

// router.post("/add", addRetailer);
router.post("/sales", authMiddleware, addSalesData);
router.get("/available-products", authMiddleware, getAvailableProducts);
router.post("/orders", placeOrder);
router.get("/orders", authMiddleware, getRetailerOrders);

module.exports = router;
