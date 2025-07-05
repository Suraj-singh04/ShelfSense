// routes/product.js
const express = require("express");
const { addProducts, getAllProducts } = require("../controllers/products-controller");

const router = express.Router();

router.post("/add", addProducts);
router.get("/products", getAllProducts);


module.exports = router;
