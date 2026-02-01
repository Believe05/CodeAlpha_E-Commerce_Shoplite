
const express = require("express");
const router = express.Router();
const Product = require("../models/product");

// Input validation middleware
const validateProduct = (req, res, next) => {
  const { name, price, stock } = req.body;
  
  if (req.method === 'POST' || req.method === 'PUT') {
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ 
        success: false,
        error: "Product name must be at least 2 characters" 
      });
    }
    
    if (!price || price <= 0) {
      return res.status(400).json({ 
        success: false,
        error: "Product price must be greater than 0" 
      });
    }
    
    if (stock !== undefined && stock < 0) {
      return res.status(400).json({ 
        success: false,
        error: "Stock cannot be negative" 
      });
    }
  }
  
  next();
};

// GET all products with filtering, sorting, and pagination
router.get("/", async (req, res) => {
  try {
    const { 
      category, 
      minPrice, 
      maxPrice, 
      search, 
      sort = 'name',
      page = 1,
      limit = 20
    } = req.query;
    
    // Build query
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Sort options
    const sortOptions = {
      'name': { name: 1 },
      '-name': { name: -1 },
      'price': { price: 1 },
      '-price': { price: -1 },
      'rating': { rating: -1 },
      '-rating': { rating: 1 },
      'newest': { createdAt: -1 }
    };
    
    const sortBy = sortOptions[sort] || { name: 1 };
    
    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Execute queries
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sortBy)
        .skip(skip)
        .limit(limitNum)
        .select('-__v'),
      Product.countDocuments(query)
    ]);
    
    // Get unique categories for filtering
    const categories = await Product.distinct('category');
    
    res.json({
      success: true,
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
        hasNext: pageNum * limitNum < total,
        hasPrev: pageNum > 1
      },
      filters: {
        categories,
        priceRange: await Product.aggregate([
          { $group: { _id: null, min: { $min: "$price" }, max: { $max: "$price" } } }
        ])
      }
    });
  } catch (err) {
    console.error("Get products error:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch products" 
    });
  }
});

// GET single product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        error: "Product not found" 
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (err) {
    console.error("Get product error:", err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        error: "Invalid product ID format" 
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch product" 
    });
  }
});

// GET products by category
router.get("/category/:category", async (req, res) => {
  try {
    const products = await Product.find({ 
      category: req.params.category 
    }).sort({ name: 1 });
    
    res.json({
      success: true,
      data: products,
      category: req.params.category,
      count: products.length
    });
  } catch (err) {
    console.error("Get products by category error:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch products" 
    });
  }
});

// POST new product (admin use)
router.post("/", validateProduct, async (req, res) => {
  try {
    // Check if product with same ID already exists
    if (req.body.id) {
      const existingProduct = await Product.findOne({ id: req.body.id });
      if (existingProduct) {
        return res.status(409).json({ 
          success: false,
          error: "Product with this ID already exists" 
        });
      }
    }
    
    const newProduct = new Product(req.body);
    await newProduct.save();
    
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: newProduct
    });
  } catch (err) {
    console.error("Create product error:", err);
    res.status(400).json({ 
      success: false,
      error: "Failed to create product",
      message: err.message 
    });
  }
});

// PUT update product
router.put("/:id", validateProduct, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedProduct) {
      return res.status(404).json({ 
        success: false,
        error: "Product not found" 
      });
    }
    
    res.json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct
    });
  } catch (err) {
    console.error("Update product error:", err);
    res.status(400).json({ 
      success: false,
      error: "Failed to update product" 
    });
  }
});

// DELETE product
router.delete("/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    
    if (!deletedProduct) {
      return res.status(404).json({ 
        success: false,
        error: "Product not found" 
      });
    }
    
    res.json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to delete product" 
    });
  }
});

// GET product statistics
router.get("/stats/summary", async (req, res) => {
  try {
    const stats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
          totalStock: { $sum: "$stock" },
          avgPrice: { $avg: "$price" },
          avgRating: { $avg: "$rating" },
          categories: { $addToSet: "$category" }
        }
      },
      {
        $project: {
          _id: 0,
          totalProducts: 1,
          totalValue: { $round: ["$totalValue", 2] },
          totalStock: 1,
          avgPrice: { $round: ["$avgPrice", 2] },
          avgRating: { $round: ["$avgRating", 2] },
          categoryCount: { $size: "$categories" }
        }
      }
    ]);
    
    // Get low stock products
    const lowStockProducts = await Product.find({ stock: { $lt: 5 } })
      .select('name stock price')
      .limit(5);
    
    res.json({
      success: true,
      data: stats[0] || {
        totalProducts: 0,
        totalValue: 0,
        totalStock: 0,
        avgPrice: 0,
        avgRating: 0,
        categoryCount: 0
      },
      lowStock: lowStockProducts
    });
  } catch (err) {
    console.error("Get stats error:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch statistics" 
    });
  }
});

module.exports = router;