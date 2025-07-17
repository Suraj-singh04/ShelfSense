require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage for testing (replace with MongoDB later)
const users = [];
const products = [];
const inventory = [];
const orders = [];
const retailers = [];

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({ message: "ShelfSense API is running!" });
});

// Authentication Routes
app.post("/auth/register", async (req, res) => {
  try {
    console.log("Registration request body:", req.body);
    
    const { username, email, password, role, location } = req.body;
    
    console.log("Registration attempt:", { username, email, role });

    // Validation - check for missing or empty fields
    if (!username || !email || !password || 
        username.trim() === "" || email.trim() === "" || password.trim() === "") {
      console.log("Registration failed - Missing required fields:", { username, email });
      return res.status(400).json({
        success: false,
        message: "Missing required fields: username, email, and password are required."
      });
    }

    // Normalize email and username to lowercase
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.toLowerCase().trim();

    // Check if user exists (case insensitive)
    const existingUser = users.find(u => 
      u.username.toLowerCase() === normalizedUsername || 
      u.email.toLowerCase() === normalizedEmail
    );
    
    if (existingUser) {
      console.log("Registration failed - User already exists:", { username: normalizedUsername, email: normalizedEmail });
      return res.status(400).json({
        success: false,
        message: "User already exists, try with a different username or email."
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = {
      id: Date.now().toString(),
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
      role: role || "retailer",
      location: location || "Unknown"
    };

    users.push(newUser);

    // Create retailer if role is retailer
    if (role === "retailer") {
      const newRetailer = {
        id: Date.now().toString(),
        name: normalizedUsername,
        location: location || "Unknown",
        salesData: [],
        userId: newUser.id
      };
      retailers.push(newRetailer);
    }

    console.log("User registered successfully:", { username: normalizedUsername, role });
    console.log("Current users in memory:", users.map(u => ({ username: u.username, email: u.email })));

    res.status(201).json({
      success: true,
      message: "User registered successfully"
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
      error: error.message
    });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    console.log("Login request body:", req.body);
    
    const { username, password } = req.body;
    console.log("Login attempt:", { username });

    // Validation - check for missing or empty fields
    if (!username || !password || username.trim() === "" || password.trim() === "") {
      console.log("Login failed - Missing required fields:", { username });
      return res.status(400).json({
        success: false,
        message: "Missing required fields: username and password are required."
      });
    }

    // Normalize username to lowercase
    const normalizedUsername = username.toLowerCase().trim();

    console.log("Looking for user with normalized username:", normalizedUsername);
    console.log("Available users:", users.map(u => ({ username: u.username, email: u.email })));

    // Find user by username OR email (case insensitive)
    const user = users.find(u => 
      u.username.toLowerCase() === normalizedUsername || 
      u.email.toLowerCase() === normalizedUsername
    );
    
    if (!user) {
      console.log("Login failed - User doesn't exist:", { username: normalizedUsername });
      console.log("Available users for comparison:", users.map(u => ({ 
        username: u.username, 
        email: u.email,
        usernameLower: u.username.toLowerCase(),
        emailLower: u.email.toLowerCase()
      })));
      return res.status(400).json({
        success: false,
        message: "User doesn't exist"
      });
    }

    console.log("User found:", { username: user.username, email: user.email });

    // Check password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      console.log("Login failed - Invalid credentials for:", { username: normalizedUsername });
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Create token
    const accessToken = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET_KEY || "fallback-secret-key",
      {
        expiresIn: "15m",
      }
    );

    console.log("User logged in successfully:", { username: user.username, role: user.role });

    res.status(200).json({
      success: true,
      message: `Logged in successfully as ${user.username}`,
      accessToken,
      userId: user.id,
      username: user.username,
      role: user.role,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
      error: error.message
    });
  }
});

// Product Routes
app.get("/product/get", (req, res) => {
  res.json({
    success: true,
    data: products.map(product => ({ ...product, _id: product.id }))
  });
});

app.post("/product/add", (req, res) => {
  const { name, description, price } = req.body;
  const newProduct = {
    id: Date.now().toString(),
    name,
    description,
    price
  };
  products.push(newProduct);
  res.json({
    success: true,
    message: "Product added successfully",
    data: { ...newProduct, _id: newProduct.id }
  });
});

// Inventory Routes
app.get("/inventory/get", (req, res) => {
  res.json({
    success: true,
    data: inventory
  });
});

app.post("/inventory/add", (req, res) => {
  const { productId, quantity, expiryDate } = req.body;
  const newInventory = {
    id: Date.now().toString(),
    productId,
    quantity,
    expiryDate
  };
  inventory.push(newInventory);
  res.json({
    success: true,
    message: "Inventory added successfully",
    data: newInventory
  });
});

// Retailer Routes
app.get("/retailer/available-products", (req, res) => {
  // Mock available products
  const availableProducts = products.map(product => ({
    ...product,
    _id: product.id,
    totalQuantity: Math.floor(Math.random() * 100) + 10,
    batches: [
      {
        quantity: Math.floor(Math.random() * 50) + 5,
        expiry: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  }));
  
  res.json({
    success: true,
    data: availableProducts
  });
});

app.get("/retailer/orders", (req, res) => {
  // Populate product object for each order
  const ordersWithProduct = orders.map(order => ({
    ...order,
    _id: order.id,
    product: products.find(p => p.id === order.productId) || null
  }));
  res.json({
    success: true,
    data: ordersWithProduct
  });
});

// Purchase Routes
app.post("/purchase/buy", (req, res) => {
  const { productId, quantity } = req.body;
  const newOrder = {
    id: Date.now().toString(),
    productId,
    quantity,
    createdAt: new Date().toISOString()
  };
  orders.push(newOrder);
  res.json({
    success: true,
    message: "Order placed successfully",
    data: { ...newOrder, _id: newOrder.id }
  });
});

app.get("/purchase/get", (req, res) => {
  // Mock purchase data
  const purchases = orders.map(order => ({
    _id: order.id,
    retailerName: "Store A",
    productName: products.find(p => p.id === order.productId)?.name || "Unknown",
    quantity: order.quantity,
    date: order.createdAt
  }));
  
  res.json({
    success: true,
    data: purchases
  });
});

// Suggestions Routes
app.get("/suggestions/retailer", (req, res) => {
  // Mock suggestions
  const suggestions = products.slice(0, 3).map(product => ({
    _id: Date.now().toString() + Math.random(),
    product: { ...product, _id: product.id },
    quantity: Math.floor(Math.random() * 20) + 5,
    reason: "Low stock detected"
  }));
  
  res.json({
    success: true,
    data: suggestions
  });
});

app.post("/suggestions/confirm/:id", (req, res) => {
  res.json({
    success: true,
    message: "Suggestion confirmed"
  });
});

app.post("/suggestions/reject/:id", (req, res) => {
  res.json({
    success: true,
    message: "Suggestion rejected"
  });
});

// Admin Routes
app.get("/admin/retailers", (req, res) => {
  // Mock retailer data
  const retailerData = retailers.map(retailer => ({
    _id: retailer.id,
    name: retailer.name,
    location: retailer.location,
    totalPurchases: Math.floor(Math.random() * 50) + 5
  }));
  
  res.json({
    success: true,
    data: retailerData
  });
});

// Test Routes
app.get("/test/users", (req, res) => {
  res.json({
    success: true,
    count: users.length,
    users: users.map(u => ({ username: u.username, email: u.email, role: u.role }))
  });
});

app.get("/debug/users", (req, res) => {
  res.json({
    success: true,
    count: users.length,
    users: users.map(u => ({ 
      id: u.id,
      username: u.username, 
      email: u.email, 
      role: u.role,
      location: u.location,
      usernameLower: u.username.toLowerCase(),
      emailLower: u.email.toLowerCase()
    }))
  });
});

app.delete("/test/users", (req, res) => {
  users.length = 0;
  products.length = 0;
  inventory.length = 0;
  orders.length = 0;
  retailers.length = 0;
  console.log("All data cleared for testing");
  res.json({
    success: true,
    message: "All data cleared"
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : "Something went wrong"
  });
});

app.listen(PORT, () => {
  console.log(`🚀 ShelfSense Server running on port ${PORT}`);
  console.log(`📝 Using in-memory storage (no MongoDB required)`);
  console.log(`🔗 API available at: http://localhost:${PORT}`);
  console.log(`🧪 Test endpoints: /test/users, DELETE /test/users`);
}); 