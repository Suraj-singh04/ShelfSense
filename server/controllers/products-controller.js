const Product = require("../../database/models/product-model");
const generateQRCode = require("../../utils/generateQR");// Generate QR code utility
const addProducts = async (req, res) => {
  try {
    const { name, category, expiryDate, batchId } = req.body;

    if (!name || !category || !expiryDate || !batchId) {
      return res.status(400).json({ error: "All fields are required" });
    }
    
    // ✅ Step 2: Generate the QR code
    const qrPath = await generateQRCode(name, expiryDate);

    const newProduct = await Product.create({
      name,
      category,
      expiryDate,
      batchId,
      qrPath // Save the QR code path in the product
    });

    res.status(201).json({ message: "Product created", data: newProduct });
  } catch (error) {
  console.error("❌ Error creating product:", error);
  res.status(500).json({ error: error.message || "Server error" });
}

};

module.exports = addProducts;
