const express = require("express");
const {
  login,
  register,
  changePassword,
} = require("../controllers/auth-controller");
const requestPasswordReset = require("../controllers/reqPasswordReset");
const resetPassword = require("../controllers/resetPassword-controller");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/change-password", changePassword);
router.post("/forgot-password", requestPasswordReset);
router.patch("/reset-password/:token", resetPassword);


module.exports = router;
