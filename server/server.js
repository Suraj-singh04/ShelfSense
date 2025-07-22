require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectToDB = require("../database/db");

const inventory = require("./routes/inventory");
const products = require("./routes/product"); // uses multer
const retailer = require("./routes/retailer");
const authRoutes = require("./routes/auth-routes");
const homeRoutes = require("./routes/home-routes");
const adminRoutes = require("./routes/admin-routes");
const purchaseRoutes = require("./routes/purchase");
const smartRoutingRoutes = require("./routes/smart-routing");
const assignToRetailerRoutes = require("./routes/assignToRetailer");
const suggestionRoutes = require("./routes/suggestions");

const runSmartRoutingScheduler = require("./scheduler");

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

app.use(express.json());

app.use("/api/products", products);

app.use("/api/auth", authRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/inventory", inventory);
app.use("/api/retailer", retailer);
app.use("/api/purchase", purchaseRoutes);
app.use("/api/smart-routing", smartRoutingRoutes);
app.use("/api/assign", assignToRetailerRoutes);
app.use("/api/suggestions", suggestionRoutes);

connectToDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ MongoDB connected`);
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 API endpoints available at http://localhost:${PORT}/api`);
      console.log(`🔗 Frontend should connect to: http://localhost:${PORT}`);
    });

    runSmartRoutingScheduler();
  })
  .catch((err) => {
    console.error("❌ Failed to connect to database:", err);
    process.exit(1);
  });

module.exports = app;
