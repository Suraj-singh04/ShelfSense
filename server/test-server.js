require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage for testing
const users = [];

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({ message: "ShelfSense API is running!" });
});

// Register route
app.post("/auth/register", async (req, res) => {
  try {
    const { username, email, password, role, location } = req.body;
    
    console.log("Registration attempt:", { username, email, role });

    // Check if user exists
    const existingUser = users.find(u => u.username === username || u.email === email);
    if (existingUser) {
      console.log("Registration failed - User already exists:", { username, email });
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
      username,
      email,
      password: hashedPassword,
      role: role || "retailer",
      location: location || "Unknown"
    };

    users.push(newUser);

    console.log("User registered successfully:", { username, role });

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

// Login route
app.post("/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log("Login attempt:", { username });

    // Find user by username OR email
    const user = users.find(u => u.username === username || u.email === username);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User doesn't exist"
      });
    }

    // Check password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
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

    console.log("User logged in successfully:", { username, role: user.role });

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

// Test data route
app.get("/test/users", (req, res) => {
  res.json({
    success: true,
    count: users.length,
    users: users.map(u => ({ username: u.username, email: u.email, role: u.role }))
  });
});

// Clear users route (for testing)
app.delete("/test/users", (req, res) => {
  users.length = 0;
  console.log("All users cleared for testing");
  res.json({
    success: true,
    message: "All users cleared"
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📝 No MongoDB required - using in-memory storage`);
  console.log(`🔗 Test the API at: http://localhost:${PORT}`);
}); 