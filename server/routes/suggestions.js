const express = require("express");
const {
  pendingSuggestions,
  confirmSuggestion,
} = require("../controllers/suggestion-controller");
const router = express.Router();

router.get("/retailer/:retailerId", pendingSuggestions);

router.post("confirm/:suggestionId", confirmSuggestion);

module.exports = router;
