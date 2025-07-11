const Purchase = require("../../database/models/purchase-model");

const addPurchase = async (req, res) => {
  try {
    const { retailerId, productId, quantity } = req.body;

    if (!retailerId || !productId || !quantity) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const purchase = new Purchase({
      retailerId,
      productId,
      quantity,
    });

    await purchase.save();

    res.status(201).json({ message: "Purchase recorded", purchase });
  } catch (error) {
    console.error("Error adding purchase:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  addPurchase,
};
