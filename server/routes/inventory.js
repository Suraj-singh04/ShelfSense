const express = require("express");
const {
  addToInventory,
  getAllInventoryItems,
} = require("../controllers/inventory-controller");
const authMiddleware = require("../middleware/auth-middleware");
const isAdminUser = require("../middleware/admin-middleware");
const router = express.Router();

router.post("/add", authMiddleware, isAdminUser, addToInventory);
router.get("/get", getAllInventoryItems);

module.exports = router;
