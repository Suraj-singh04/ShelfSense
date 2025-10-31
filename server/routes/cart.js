const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth-middleware");
const {
  getCart,
  updateQuantity,
  applyPromo,
  addToCart,
} = require("../controllers/cart-controller");

router.get("/", authMiddleware, getCart);
router.post("/add", authMiddleware, addToCart);
router.put("/update", authMiddleware, updateQuantity);
router.post("/apply-promo", authMiddleware, applyPromo);

module.exports = router;
