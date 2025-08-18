const Product = require("../../database/models/product-model");
const Inventory = require("../../database/models/inventory-model");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Define storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "ShelfSenseProducts",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

const upload = multer({ storage: storage });

const handleImageUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { productId, inventoryId } = req.body;
    console.log("Upload request:", { productId, inventoryId, file: req.file });

    const imageUrl = req.file.path;

    if (productId) {
      const product = await Product.findByIdAndUpdate(
        productId,
        { imageUrl },
        { new: true }
      );
      return res.status(200).json({
        message: "Image uploaded and added to product",
        data: product,
      });
    }

    if (inventoryId) {
      const inventory = await Inventory.findByIdAndUpdate(
        inventoryId,
        { imageUrl },
        { new: true }
      );
      return res.status(200).json({
        message: "Image uploaded and added to inventory",
        data: inventory,
      });
    }

    // Return just the image URL for general uploads
    return res.status(200).json({
      success: true,
      imageUrl,
      filename: req.file.filename,
    });
  } catch (err) {
    console.error("Image Upload Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { upload, handleImageUpload };
