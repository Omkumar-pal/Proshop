import asyncHandler from "express-async-handler";
import Products from "../models/productModel.js";
import {
  generateEmbedding,
  buildProductText,
} from "../utilities/embeddings.js";

// @desc fetch all products
// @route GET /api/products
// @access public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;
  const keyword = req.query.keyword ? req.query.keyword.trim() : "";

  const keywordFilter = keyword
    ? { name: { $regex: keyword, $options: "i" } }
    : {};

  const count = await Products.countDocuments({ ...keywordFilter });
  let products = await Products.find({ ...keywordFilter })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  // If a keyword was given but exact/regex match found nothing,
  // fall back to semantic search so the user still gets relevant results
  if (keyword && products.length === 0) {
    const queryEmbedding = await generateEmbedding(keyword);

    products = await Products.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit: pageSize,
        },
      },
      {
        $project: {
          embedding: 0,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ]);

    return res.json({ products, page: 1, pages: 1 });
  }

  res.json({ products, page, pages: Math.ceil(count / pageSize) });
});
// @desc fetch single product
// @route GET /api/products/:id
// @access public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Products.findById(req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc Delete a Product
// @route DELETE /api/products/:id
// @access Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Products.findById(req.params.id);
  if (product) {
    await product.deleteOne();
    res.json({ message: "Product Removed." });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc  Create a Product
// @route POST /api/products
// @access Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const productData = {
    name: "Sample name",
    price: 0,
    user: req.user._id,
    image: "/images/sample.jpg",
    brand: "Sample brand",
    category: "Sample category",
    countInStock: 0,
    numReviews: 0,
    description: "Sample description",
  };

  productData.embedding = await generateEmbedding(
    buildProductText(productData),
  );

  const product = new Products(productData);
  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc  Update a Product
// @route PUT /api/products/:id
// @access Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, brand, category, countInStock } =
    req.body;
  const product = await Products.findById(req.params.id);
  if (product) {
    product.name = name;
    product.price = price;
    product.description = description;
    if (image && image.data) {
      product.image = {
        data: Buffer.from(image.data, "base64"),
        contentType: image.contentType,
      };
    }
    product.brand = brand;
    product.countInStock = countInStock;
    product.category = category;

    product.embedding = await generateEmbedding(buildProductText(product));

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error("Product Not Found");
  }
});

// @desc  Create new Review
// @route POST /api/products/:id/reviews
// @access Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  req.body;
  const product = await Products.findById(req.params.id);
  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString(),
    );
    if (alreadyReviewed) {
      res.status(400);
      throw new Error("Product already reviewed");
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: "Review added" });
  } else {
    res.status(404);
    throw new Error("Product Not Found");
  }
});

// @desc  Get Top Rated Products
// @route GET /api/products/top
// @access Public
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Products.find({}).sort({ rating: -1 }).limit(3);
  res.json(products);
});

// @desc  Semantic search for products using vector similarity
// @route POST /api/products/semantic-search
// @access Public
const semanticSearchProducts = asyncHandler(async (req, res) => {
  const { query, limit = 8 } = req.body;

  if (!query || !query.trim()) {
    res.status(400);
    throw new Error("Search query is required");
  }

  const queryEmbedding = await generateEmbedding(query);

  const results = await Products.aggregate([
    {
      $vectorSearch: {
        index: "vector_index",
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: 100,
        limit: Number(limit),
      },
    },
    {
      $project: {
        embedding: 0,
        score: { $meta: "vectorSearchScore" },
      },
    },
  ]);

  res.json({ products: results });
});

// @desc  Serve a product's image from MongoDB
// @route GET /api/products/:id/image
// @access Public
const getProductImage = asyncHandler(async (req, res) => {
  const product = await Products.findById(req.params.id).select("image");

  if (!product || !product.image || !product.image.data) {
    res.status(404);
    throw new Error("Image not found");
  }

  res.set("Content-Type", product.image.contentType);
  res.send(product.image.data);
});

export {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  createProductReview,
  getTopProducts,
  semanticSearchProducts,
  getProductImage,
};
