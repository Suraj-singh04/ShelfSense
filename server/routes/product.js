// routes/product.js
const express = require("express");
const {
  addProducts,
  getAllProducts,
  searchProducts,
} = require("../controllers/products-controller");
const authMiddleware = require("../middleware/auth-middleware");
const isAdminUser = require("../middleware/admin-middleware");
const router = express.Router();

router.post("/add", authMiddleware, isAdminUser, addProducts);
router.get("/get", getAllProducts);
router.get("/search", searchProducts);

module.exports = router;
