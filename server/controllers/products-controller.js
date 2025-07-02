const Product = require("../../database/models/product-model");

const addProducts = async (req, res) => {
  try {
    const { name, category, expiryDate, batchId } = req.body;

    if (!name || !category || !expiryDate || !batchId) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newProduct = await Product.create({
      name,
      category,
      expiryDate,
      batchId,
    });

    res.status(201).json({ message: "Product created", data: newProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = addProducts;
