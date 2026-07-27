import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import users from "./Data/user.js";
import products from "./Data/products.js";
import User from "./models/userModel.js";
import Product from "./models/productModel.js";
import Order from "./models/orderModel.js";
import connectDB from "./config/db.js";
import colors from "colors";
import { generateEmbedding, buildProductText } from "./utilities/embeddings.js";

dotenv.config();
connectDB();

const __dirname = path.resolve();

// Reads the actual image file (e.g. frontend/public/images/airpods.jpg)
// and converts it into a Buffer + contentType for MongoDB storage
const loadImageBuffer = (imagePath) => {
  // imagePath looks like "/images/airpods.jpg"
  const fullPath = path.join(__dirname, "frontend", "public", imagePath);
  const data = fs.readFileSync(fullPath);
  const ext = path.extname(imagePath).toLowerCase();
  const contentType = ext === ".png" ? "image/png" : "image/jpeg";
  return { data, contentType };
};

const importData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    const createdUsers = await User.insertMany(users);
    const adminUser = createdUsers[0]._id;

    console.log("Generating embeddings and loading images...");

    const sampleProducts = [];
    for (const product of products) {
      const image = loadImageBuffer(product.image);
      const embedding = await generateEmbedding(buildProductText(product));

      sampleProducts.push({
        ...product,
        image,
        embedding,
        user: adminUser,
      });
      console.log(`✓ Prepared: ${product.name}`);
    }

    await Product.insertMany(sampleProducts);
    console.log("Data Imported!".green.inverse);
    process.exit();
  } catch (error) {
    console.error("Error importing data:".red.inverse, error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log("Data Destroyed!".yellow.inverse);
    process.exit();
  } catch (error) {
    console.error("Error destroying data:".red.inverse, error);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
