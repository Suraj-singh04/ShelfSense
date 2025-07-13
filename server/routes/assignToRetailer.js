const express = require("express");
const router = express.Router();
const {
  assignRetailersToExpiringProducts,
} = require("../controllers/assignToRetailer-controller");
const authMiddleware = require("../middleware/auth-middleware");
const isAdminUser = require("../middleware/admin-middleware");

router.post(
  "/assignRetailers",
  authMiddleware,
  isAdminUser,
  assignRetailersToExpiringProducts
);

module.exports = router;
