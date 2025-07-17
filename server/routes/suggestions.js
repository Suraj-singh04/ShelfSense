const express = require("express");
const {
  pendingSuggestions,
  confirmSuggestion,
  rejectSuggestion,
} = require("../controllers/suggestion-controller");
const authMiddleware = require("../middleware/auth-middleware");
const router = express.Router();

router.get("/retailer/pending-suggestions", authMiddleware, pendingSuggestions);
router.post("/confirm/:suggestionId", authMiddleware, confirmSuggestion);
router.post("/reject/:suggestionId", authMiddleware, rejectSuggestion);

module.exports = router;
