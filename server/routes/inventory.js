const express = require("express");
const {
  addToInventory,
  getAllProducts,
} = require("../controllers/inventory-controller");
const router = express.Router();

router.post("/add", addToInventory);
router.get("/get", getAllProducts);

module.exports = router;
