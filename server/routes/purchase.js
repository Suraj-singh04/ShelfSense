const express = require("express");
const router = express.Router();
const { addPurchase } = require("../controllers/purchase-controller");

router.post("/buy", addPurchase);

module.exports = router;
