const express = require("express");
const router = express.Router();
const {
  assignRetailersToExpiringProducts,
} = require("../controllers/assignToRetailer-controller");

router.post("/assignRetailers", assignRetailersToExpiringProducts);

module.exports = router;
