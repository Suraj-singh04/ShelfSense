const express = require("express");
const router = express.Router();
const {
  getExpiringProductSuggestions,
} = require("../controllers/smartRouting-controller");

router.get("/getSuggestions", getExpiringProductSuggestions);

module.exports = router;
