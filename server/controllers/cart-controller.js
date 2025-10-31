const Cart = require("../../database/models/cart-model");
const Product = require("../../database/models/product-model");

const Retailer = require("../../database/models/retailer-model");

const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.userInfo?.userId;

    // Find retailer
    const retailer = await Retailer.findOne({ userId });
    if (!retailer) {
      return res
        .status(404)
        .json({ success: false, message: "Retailer not found" });
    }

    // Find product
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Get or create cart
    let cart = await Cart.findOne({ retailerId: retailer._id });
    if (!cart) {
      cart = await Cart.create({
        retailerId: retailer._id,
        items: [],
      });
    }

    // Check if product already in cart
    const existingItem = cart.items.find(
      (i) => i.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      cart.items.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.imageUrl, // check field name in your Product schema
        quantity: Number(quantity),
      });
    }

    await cart.save();

    // Calculate total
    const total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    res.json({
      success: true,
      message: "Item added to cart",
      cart: {
        ...cart.toObject(),
        total: total + cart.shippingCost,
      },
    });
  } catch (err) {
    console.error("❌ addToCart error:", err);
    res.status(500).json({ success: false, error: "Failed to add to cart" });
  }
};

const getCart = async (req, res) => {
  try {
    const userId = req.userInfo?.userId;
    const retailer = await Retailer.findOne({ userId });

    if (!retailer) {
      return res
        .status(404)
        .json({ success: false, message: "Retailer not found" });
    }
    let cart = await Cart.findOne({ retailerId: retailer._id });

    if (!cart) {
      cart = await Cart.create({ retailerId: retailer._id, items: [] });
    }

    const total = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    res.json({
      success: true,
      data: {
        ...cart.toObject(),
        total: total + cart.shippingCost,
      },
    });
  } catch (err) {
    console.error("❌ getCart error:", err);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
};

const updateQuantity = async (req, res) => {
  try {
    const { productId, action } = req.body;
    const userId = req.userInfo?.userId;
    const retailer = await Retailer.findOne({ userId });

    if (!retailer) {
      return res
        .status(404)
        .json({ success: false, message: "Retailer not found" });
    }

    let cart = await Cart.findOne({ retailerId: retailer._id });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const item = cart.items.find((i) => i.productId.toString() === productId);

    if (!item) return res.status(404).json({ error: "Item not in cart" });

    if (action === "increase") {
      item.quantity += 1;
    } else if (action === "decrease") {
      item.quantity = Math.max(1, item.quantity - 1);
    } else if (action === "remove") {
      cart.items = cart.items.filter(
        (i) => i.productId.toString() !== productId
      );
    }

    await cart.save();

    const total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    res.json({
      success: true,
      data: {
        ...cart.toObject(),
        total: total + cart.shippingCost,
      },
    });
  } catch (err) {
    console.error("❌ updateQuantity error:", err);
    res.status(500).json({ error: "Failed to update cart" });
  }
};

const applyPromo = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.userInfo?.userId;
    const retailer = await Retailer.findOne({ userId });

    if (!retailer) {
      return res
        .status(404)
        .json({ success: false, message: "Retailer not found" });
    }

    let cart = await Cart.findOne({ retailerId: retailer._id });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    let discount = 0;
    if (code === "DISCOUNT10") discount = 0.1; // 10% off
    else if (code === "FREESHIP") {
      cart.shippingCost = 0;
    } else {
      return res.status(400).json({ error: "Invalid promo code" });
    }

    cart.promoCode = code;
    await cart.save();

    const total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const finalTotal = discount > 0 ? total * (1 - discount) : total;

    res.json({
      success: true,
      data: {
        ...cart.toObject(),
        total: finalTotal + cart.shippingCost,
      },
    });
  } catch (err) {
    console.error("❌ applyPromo error:", err);
    res.status(500).json({ error: "Failed to apply promo" });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateQuantity,
  applyPromo,
};
