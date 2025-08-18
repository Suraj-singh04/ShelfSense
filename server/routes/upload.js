const express = require("express");
const router = express.Router();
const { upload, handleImageUpload } = require("../controllers/upload-controller");

// ✅ CORS headers for OPTIONS preflight (optional but useful)
router.options("/", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173"); // Allow Vite frontend
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.sendStatus(200);
});

// ✅ POST /api/upload – Main image upload route
router.post("/", upload.single("image"), handleImageUpload);

module.exports = router;
