module.exports = {
  // Default thresholds as percentages of product lifecycle
  SUGGESTION_PHASES: {
    EARLY: 0.3, // Start suggesting when 30% of shelf life has passed
    MEDIUM: 0.6, // Increase frequency at 60%
    URGENT: 0.8, // Daily suggestions at 80%
    CRITICAL: 0.95, // Hourly suggestions at 95%
  },

  // Suggestion intervals in hours
  SUGGESTION_INTERVALS: {
    EARLY: 168, // Weekly (7 days)
    MEDIUM: 72, // Every 3 days
    URGENT: 24, // Daily
    CRITICAL: 6, // Every 6 hours
  },

  // Minimum quantities and thresholds
  MIN_SUGGESTION_QUANTITY: 1,
  MAX_RETAILERS_TO_TRY: 5,
  FALLBACK_TIMEOUT_HOURS: 24,

  // Retailer scoring weights
  RETAILER_SCORING: {
    SALES_VELOCITY_WEIGHT: 0.4,
    PURCHASE_HISTORY_WEIGHT: 0.3,
    SUCCESS_RATE_WEIGHT: 0.2,
    RECENCY_WEIGHT: 0.1,
  },

  // Product categories with custom settings
  CATEGORY_OVERRIDES: {
    dairy: {
      SUGGESTION_PHASES: {
        EARLY: 0.2,
        MEDIUM: 0.5,
        URGENT: 0.7,
        CRITICAL: 0.9,
      },
    },
    meat: {
      SUGGESTION_PHASES: {
        EARLY: 0.2,
        MEDIUM: 0.5,
        URGENT: 0.7,
        CRITICAL: 0.9,
      },
    },
    produce: {
      SUGGESTION_PHASES: {
        EARLY: 0.1,
        MEDIUM: 0.4,
        URGENT: 0.6,
        CRITICAL: 0.85,
      },
    },
  },
};
