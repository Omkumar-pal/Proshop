import "colors";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Products from "../models/productModel.js";
import { generateEmbedding, buildProductText } from "./embeddings.js";

dotenv.config();
connectDB();

const backfill = async () => {
  try {
    const products = await Products.find({});
    console.log(`Found ${products.length} products. Generating embeddings...`);

    for (const product of products) {
      const text = buildProductText(product);
      product.embedding = await generateEmbedding(text);
      await product.save();
      console.log(`✓ Embedded: ${product.name}`);
    }

    console.log("Backfill complete.");
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

backfill();
