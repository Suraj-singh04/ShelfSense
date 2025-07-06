require("dotenv").config();
const express = require("express");
const connectToDB = require("../database/db");
const inventory = require("./routes/inventory");
const products = require("./routes/product");
const retailer = require("./routes/retailer");
const purchaseRoutes = require("./routes/purchase");
const smartRoutingRoutes = require("./routes/smart-routing");
const assignToRetailerRoutes = require("./routes/assignToRetailer");
// const clearAllData = require("../database/temp");
// const seed = require("./seed");
// clearAllData();
// seed();
const suggestionRoutes = require("./routes/suggestions");

connectToDB();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/inventory", inventory);
app.use("/api/products", products);
app.use("/api/retailer", retailer);
app.use("/api/purchase", purchaseRoutes);
app.use("/api/smart-routing", smartRoutingRoutes);
app.use("api/assign", assignToRetailerRoutes);
app.use("api/suggestions", suggestionRoutes);

app.listen(PORT, () => {
  console.log("Server is running");
});
