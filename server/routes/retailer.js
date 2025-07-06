const express = require("express");
const router = express.Router();
const {
  addRetailer,
  addSalesData,
} = require("../controllers/retailer-controller");

router.post("/add", addRetailer);

router.post("/:retailerId/sales", addSalesData);

module.exports = router;
