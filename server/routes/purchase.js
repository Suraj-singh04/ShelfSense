const express = require("express");
const router = express.Router();
const { addPurchase } = require("../controllers/purchase-controller");

router.post("/add", addPurchase);

module.exports = router;
