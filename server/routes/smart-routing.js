const express = require("express");
const router = express.Router();
const {
  getExpiringProductSuggestions,
} = require("../controllers/smartRouting-controller");
const authMiddleware = require("../middleware/auth-middleware");
const isAdminUser = require("../middleware/admin-middleware");

router.get(
  "/getSuggestions",
  authMiddleware,
  isAdminUser,
  getExpiringProductSuggestions
);

module.exports = router;
