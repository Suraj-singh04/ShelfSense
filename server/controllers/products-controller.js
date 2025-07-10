const Product = require("../../database/models/product-model");
const generateQRCode = require("../../utils/generateQR");
const addProducts = async (req, res) => {
  try {
    const { name, category, batches } = req.body;

    if (
      !name ||
      !category ||
      !batches ||
      !Array.isArray(batches) ||
      batches.length === 0
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // const qrPath = await generateQRCode(name, expiryDate);
    for (const batch of batches) {
      if (!batch.batchId || !batch.expiryDate) {
        return res
          .status(400)
          .json({ error: "Each batch must have batchId and expiryDate" });
      }
    }

    const newProduct = await Product.create({
      name,
      category,
      batches,
    });

    res.status(201).json({ message: "Product created", data: newProduct });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch products" });
  }
};

const searchProducts = async (req, res) => {
  const name = req.query.name;
  const products = await Product.find({ name: new RegExp(name, "i") });
  res.json(products);
};

module.exports = {
  addProducts,
  getAllProducts,
  searchProducts,
};
