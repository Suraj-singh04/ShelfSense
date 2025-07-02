const express = require("express");
const addToInventory = require("../controllers/inventory-controller");
const router = express.Router();

router.post("/add", addToInventory);

module.exports = router;
