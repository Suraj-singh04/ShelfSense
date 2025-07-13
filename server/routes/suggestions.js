const express = require("express");
const {
  pendingSuggestions,
  confirmSuggestion,
  rejectSuggestion,
} = require("../controllers/suggestion-controller");
const authMiddleware = require("../middleware/auth-middleware");
const router = express.Router();

router.get("/retailer/pending-Suggestions", authMiddleware, pendingSuggestions);
router.post("/confirm/:suggestionId", authMiddleware.apply, confirmSuggestion);
router.post("/reject/:suggestionId", authMiddleware, rejectSuggestion);

module.exports = router;
