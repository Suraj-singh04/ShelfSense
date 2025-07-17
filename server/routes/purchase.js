const express = require("express");
const router = express.Router();
const {
  addPurchase,
  getAllPurchases,
} = require("../controllers/purchase-controller");
const authMiddleware = require("../middleware/auth-middleware");

router.post("/buy", authMiddleware, addPurchase);
router.get("/get", getAllPurchases);

module.exports = router;
