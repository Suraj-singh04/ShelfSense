const express = require("express");
const {
  addToInventory,
  getAllInventoryItems,
} = require("../controllers/inventory-controller");
const router = express.Router();

router.post("/add", addToInventory);
router.get("/get", getAllInventoryItems);

module.exports = router;
