const Product = require("../../database/models/product-model");

const addProducts = async (req, res) => {
  try {
    const { name, category, price, batches } = req.body;

    if (
      !name ||
      !category ||
      price === undefined ||
      isNaN(Number(price)) ||
      !batches ||
      !Array.isArray(batches) ||
      batches.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "All fields are required and valid" });
    }

    const parsedPrice = Number(price);

    let existingProduct = await Product.findOne({ name, category });

    if (existingProduct) {
      for (const batch of batches) {
        const alreadyExists = existingProduct.batches.some(
          (b) => b.batchId === batch.batchId
        );
        if (!alreadyExists) {
          existingProduct.batches.push(batch);
        }
      }

      await existingProduct.save();
      return res.status(200).json({
        message: "Batches added to existing product",
        data: existingProduct,
      });
    }

    const newProduct = await Product.create({
      name,
      category,
      price: parsedPrice,
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
