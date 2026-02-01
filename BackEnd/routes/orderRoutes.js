
const express = require("express");
const jwt = require("jsonwebtoken");
const Order = require("../models/order");
const mongoose = require("mongoose");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET is not set in environment variables');
  process.exit(1);
}

// JWT authentication middleware
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ 
      success: false,
      error: 'No token provided' 
    });
  }
  
  const token = authHeader.split(' ')[1]; // Expecting "Bearer <token>"
  
  if (!token) {
    return res.status(401).json({ 
      success: false,
      error: 'Token format: Bearer <token>' 
    });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId; // Set userId from token
    next();
  } catch (error) {
    console.error("Token verification error:", error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        error: 'Token expired' 
      });
    }
    
    res.status(401).json({ 
      success: false,
      error: 'Invalid token' 
    });
  }
}

// Validation middleware for order creation
function validateOrder(req, res, next) {
  const { items, shipping } = req.body;
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ 
      success: false,
      error: "Order must contain at least one item" 
    });
  }
  
  // Validate each item
  for (const item of items) {
    if (!item.productId || !item.name || !item.price || !item.quantity) {
      return res.status(400).json({ 
        success: false,
        error: "Each item must have productId, name, price, and quantity" 
      });
    }
    
    if (item.price <= 0) {
      return res.status(400).json({ 
        success: false,
        error: "Item price must be greater than 0" 
      });
    }
    
    if (item.quantity <= 0) {
      return res.status(400).json({ 
        success: false,
        error: "Item quantity must be at least 1" 
      });
    }
  }
  
  if (!shipping || !shipping.address || !shipping.city || !shipping.postalCode) {
    return res.status(400).json({ 
      success: false,
      error: "Complete shipping information is required" 
    });
  }
  
  next();
}

// POST /api/orders - Create new order
router.post("/", verifyToken, validateOrder, async (req, res) => {
  try {
    const { items, shipping, notes, paymentMethod } = req.body;
    
    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.15; // 15% VAT for South Africa
    const shippingCost = subtotal > 1000 ? 0 : 99; // Free shipping over R1000
    const total = subtotal + tax + shippingCost;

    const order = new Order({
      userId: req.userId,
      items: items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      subtotal,
      tax,
      shippingCost,
      total,
      shipping: {
        address: shipping.address,
        city: shipping.city,
        postalCode: shipping.postalCode,
        country: shipping.country || 'South Africa'
      },
      notes: notes || '',
      paymentMethod: paymentMethod || 'Credit Card',
      status: 'Pending'
    });

    await order.save();
    
    res.status(201).json({ 
      success: true,
      message: "Order placed successfully", 
      order: {
        id: order._id,
        orderNumber: `ORD-${order._id.toString().slice(-6).toUpperCase()}`,
        items: order.items,
        subtotal: order.subtotal,
        tax: order.tax,
        shippingCost: order.shippingCost,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      }
    });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to create order",
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// GET /api/orders - Get user's orders with pagination
router.get("/", verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build query
    const query = { userId: req.userId };
    
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Get orders with pagination
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');
    
    // Get total count for pagination
    const total = await Order.countDocuments(query);
    
    res.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error("Get orders error:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch orders" 
    });
  }
});

// GET /api/orders/:id - Get specific order
router.get("/:id", verifyToken, async (req, res) => {
  try {
    // Check if ID is valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid order ID format" 
      });
    }
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        error: "Order not found" 
      });
    }
    
    // Check if user owns this order
    if (order.userId.toString() !== req.userId) {
      return res.status(403).json({ 
        success: false,
        error: "Access denied. You can only view your own orders." 
      });
    }
    
    // Add order number for display
    const orderWithNumber = order.toObject();
    orderWithNumber.orderNumber = `ORD-${order._id.toString().slice(-6).toUpperCase()}`;
    
    res.json({
      success: true,
      data: orderWithNumber
    });
  } catch (err) {
    console.error("Get order error:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch order" 
    });
  }
});

// GET /api/orders/stats/summary - Get order summary
router.get("/stats/summary", verifyToken, async (req, res) => {
  try {
    const stats = await Order.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.userId) } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$total" },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] }
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ["$status", "Delivered"] }, 1, 0] }
          }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: stats[0] || {
        totalOrders: 0,
        totalSpent: 0,
        pendingOrders: 0,
        deliveredOrders: 0
      }
    });
  } catch (err) {
    console.error("Get stats error:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch order statistics" 
    });
  }
});

module.exports = router;