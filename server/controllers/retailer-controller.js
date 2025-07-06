const Retailer = require("../../database/models/retailer-model");
const Product = require("../../database/models/product-model");

const addRetailer = async (req, res) => {
  try {
    const { name, location, salesData } = req.body;

    if (!name || !location) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!Array.isArray(salesData)) {
      return res.status(400).json({ error: "Sales data must be an array" });
    }

    const newRetailer = await Retailer.create({
      name,
      location,
      salesData,
    });
    res.status(201).json({ message: "Retailer created", data: newRetailer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addSalesData = async (req, res) => {
  try {
    const { productName, unitsSold } = req.body;
    const { retailerId } = req.params;

    // Find product by name
    const product = await Product.findOne({ name: productName });
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const retailer = await Retailer.findById(retailerId);
    if (!retailer) {
      return res.status(404).json({ message: "Retailer not found." });
    }

    const salesEntry = retailer.salesData.find(
      (entry) => entry.productId.toString() === product._id.toString()
    );

    if (salesEntry) {
      salesEntry.unitsSold += unitsSold;
    } else {
      retailer.salesData.push({ productId: product._id, unitsSold });
    }

    await retailer.save();

    res.status(200).json({ success: true, message: "Sales data updated." });
  } catch (err) {
    console.error("Sales Data Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addRetailer,
  addSalesData,
};
