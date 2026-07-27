import { pipeline } from "@xenova/transformers";

let embedder = null;

// Lazy-load the model once, reuse across calls
const getEmbedder = async () => {
  if (!embedder) {
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return embedder;
};

// Returns a 384-dimensional normalized vector for the given text
export const generateEmbedding = async (text) => {
  const model = await getEmbedder();
  const output = await model(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
};

// Builds the text we embed from a product doc — keep this consistent
// between backfill script and create/update controller
export const buildProductText = (product) => {
  return `${product.name}. Brand: ${product.brand}. Category: ${product.category}. ${product.description}`;
};
