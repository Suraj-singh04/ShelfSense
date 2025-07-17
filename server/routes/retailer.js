const express = require("express");
const router = express.Router();
const {
  // addRetailer,
  addSalesData,
  getAvailableProducts,
  placeOrder,
  getRetailerOrders,
  getAllRetailers,
} = require("../controllers/retailer-controller");
const authMiddleware = require("../middleware/auth-middleware");

// router.post("/add", addRetailer);
router.post("/sales", authMiddleware, addSalesData);
router.get("/available-products", authMiddleware, getAvailableProducts);
router.post("/place-order", authMiddleware, placeOrder);
router.get("/orders", authMiddleware, getRetailerOrders);
router.get("/get", getAllRetailers);

module.exports = router;
