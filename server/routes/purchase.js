const express = require("express");
const router = express.Router();
const {
  addPurchase,
  getAllPurchasesAdmin,
  getAllPurchasesRetailer,
} = require("../controllers/purchase-controller");
const authMiddleware = require("../middleware/auth-middleware");
const isAdminUser = require("../middleware/admin-middleware");

router.post("/buy", authMiddleware, addPurchase);
router.get("/get", authMiddleware, getAllPurchasesRetailer);
router.get("/admin/get", authMiddleware, isAdminUser, getAllPurchasesAdmin);

module.exports = router;
