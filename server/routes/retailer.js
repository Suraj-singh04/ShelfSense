const express = require("express");
const router = express.Router();
const {
  addSalesData,
  getAvailableProducts,
  getRetailerOrders,
  getAllRetailers,
  getRetailersWithStats,
} = require("../controllers/retailer-controller");
const authMiddleware = require("../middleware/auth-middleware");

router.post("/sales", authMiddleware, addSalesData);
router.get("/available-products", authMiddleware, getAvailableProducts);
router.get("/orders", authMiddleware, getRetailerOrders);
router.get("/stats", authMiddleware, getRetailersWithStats);
router.get("/get", getAllRetailers);

module.exports = router;
