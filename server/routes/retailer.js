const express = require("express");
const router = express.Router();
const {
  addRetailer,
  addSalesData,
  getAvailableProducts,
  placeOrder,
  getRetailerOrders,
} = require("../controllers/retailer-controller");

router.post("/add", addRetailer);
router.post("/:retailerId/sales", addSalesData);
router.get("/available-products", getAvailableProducts);
router.post("/order", placeOrder);
router.get("/:retailerId/orders", getRetailerOrders);


module.exports = router;
