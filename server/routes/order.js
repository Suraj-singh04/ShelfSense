const express = require("express");

const {
  getBySessionId,
  getById,
  getLatestOrderByProduct,
} = require("../controllers/orders-controller");
const authMiddleware = require("../middleware/auth-middleware");

const router = express.Router();

router.get("/latest-by-product/:productId", getLatestOrderByProduct);

router.get("/session/:sessionId", authMiddleware, getBySessionId);

module.exports = router;
