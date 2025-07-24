const express = require("express");
const router = express.Router();
const {
  addSalesData,
  getAvailableProducts,
  getRetailerOrders,
  getAllRetailers,
  getRetailersWithStats,
  getRetailerSalesSummary,
  getRetailerSales,
} = require("../controllers/retailer-controller");
const authMiddleware = require("../middleware/auth-middleware");

router.post("/add-sales", authMiddleware, addSalesData);
router.get("/available-products", authMiddleware, getAvailableProducts);
router.get("/orders", authMiddleware, getRetailerOrders);
router.get("/stats", authMiddleware, getRetailersWithStats);
router.get("/get", getAllRetailers);
router.get("/sales/summary", authMiddleware, getRetailerSalesSummary);
router.get("/sales/data", authMiddleware, getRetailerSales);


module.exports = router;
