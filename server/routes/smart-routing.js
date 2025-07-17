const express = require("express");
const router = express.Router();
const {
  getExpiringProductSuggestions,
  getRetailerSuggestions,
  getAllSuggestions,
} = require("../controllers/smartRouting-controller");
const authMiddleware = require("../middleware/auth-middleware");
const isAdminUser = require("../middleware/admin-middleware");

router.get("/getSuggestions", authMiddleware, getExpiringProductSuggestions);
router.get("/get", authMiddleware, isAdminUser, getAllSuggestions);
router.get("/my-suggestions", authMiddleware, getRetailerSuggestions);

module.exports = router;
