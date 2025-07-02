// routes/product.js
const express = require("express");
const addProducts = require("../controllers/products-controller");
const router = express.Router();

router.post("/add", addProducts);

module.exports = router;
