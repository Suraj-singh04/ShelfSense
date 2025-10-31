const express = require("express");
const {
  checkout,
  handleWebhook,
  getStripeInvoice,
} = require("../controllers/payment-controller");
const authMiddleware = require("../middleware/auth-middleware");

const router = express.Router();

router.post("/checkout", authMiddleware, checkout);
router.get("/invoice/:sessionId", getStripeInvoice);

module.exports = router;
