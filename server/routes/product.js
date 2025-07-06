// routes/product.js
const express = require("express");
const {
  addProducts,
  getAllProducts,
  searchProducts,
} = require("../controllers/products-controller");
const router = express.Router();

router.post("/add", addProducts);
router.get("/get", getAllProducts);
router.get("/search", searchProducts);


module.exports = router;
