const Product = require("../../database/models/product-model");
const getSmartRoutingSuggestion = require("../services/smartRoutingSuggestion");

const getExpiringProductSuggestions = async (req, res) => {
  try {
    const thresholdDays = 10;
    const thresholdDate = new Date(
      Date.now() + thresholdDays * 24 * 60 * 60 * 1000
    );

    const expiringProducts = await Product.find({
      expiryDate: { $lte: thresholdDate },
    });

    const suggestions = [];

    for (const product of expiringProducts) {
      const suggestion = await getSmartRoutingSuggestion(product._id);

      suggestions.push({
        product: {
          id: product._id,
          name: product.name,
          expiresInDays: Math.ceil(
            (new Date(product.expiryDate) - Date.now()) / (1000 * 60 * 60 * 24)
          ),
        },
        suggestion,
      });
    }

    res.status(200).json({ success: true, suggestions });
  } catch (error) {
    console.error("Smart routing error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getExpiringProductSuggestions,
};
