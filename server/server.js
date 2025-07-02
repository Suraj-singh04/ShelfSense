require("dotenv").config();
const express = require("express");
const connectToDB = require("../database/db");
const inventory = require("./routes/inventory");
const products = require("./routes/product");

connectToDB();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/inventory", inventory);
app.use("/products", products);

app.listen(PORT, () => {
  console.log("Server is running");
});
