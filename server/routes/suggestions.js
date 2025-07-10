const express = require("express");
const {
  pendingSuggestions,
  confirmSuggestion,
  rejectSuggestion,
} = require("../controllers/suggestion-controller");
const router = express.Router();

router.get("/retailer/:retailerId", pendingSuggestions);
router.post("/confirm/:suggestionId", confirmSuggestion);
router.post("/reject/:suggestionId", rejectSuggestion);

module.exports = router;
