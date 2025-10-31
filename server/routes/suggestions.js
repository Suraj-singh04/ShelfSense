// const express = require("express");
// const {
//   pendingSuggestions,
//   confirmSuggestion,
//   rejectSuggestion,
// } = require("../controllers/suggestion-handling-controller");
// const authMiddleware = require("../middleware/auth-middleware");
// const router = express.Router();

// router.get("/retailer/pending-suggestions", authMiddleware, pendingSuggestions);
// router.post("/confirm/:suggestionId", authMiddleware, confirmSuggestion);
// router.post("/reject/:suggestionId", authMiddleware, rejectSuggestion);

// module.exports = router;

const express = require("express");
const router = express.Router();
const {
  pendingSuggestions,
  confirmSuggestion,
  rejectSuggestion,
} = require("../controllers/suggestion-handling-controller");
const authMiddleware = require("../middleware/auth-middleware");

// Retailer-facing actions
router.get("/retailer/pending-suggestions", authMiddleware, pendingSuggestions);
router.post("/confirm/:suggestionId", authMiddleware, confirmSuggestion);
router.post("/reject/:suggestionId", authMiddleware, rejectSuggestion);

module.exports = router;
