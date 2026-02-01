// models/product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    minlength: [2, 'Product name must be at least 2 characters'],
    maxlength: [100, 'Product name cannot exceed 100 characters'],
    index: true
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true,
    index: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0.01, 'Price must be greater than 0'],
    max: [1000000, 'Price cannot exceed R1,000,000']
  },
  image: {
    type: String,
    default: 'images/default-product.jpg',
    validate: {
      validator: function(v) {
        // Basic URL validation
        return /\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Image must be a valid image file (jpg, png, gif, webp)'
    }
  },
  short: {
    type: String,
    required: [true, 'Short description is required'],
    trim: true,
    minlength: [10, 'Short description must be at least 10 characters'],
    maxlength: [150, 'Short description cannot exceed 150 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [20, 'Description must be at least 20 characters'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot exceed 5'],
    set: v => Math.round(v * 10) / 10 // Round to 1 decimal place
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0,
    index: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    enum: {
      values: ['Laptop', 'Smartphone', 'Headphones', 'Accessory', 'Tablet', 'Monitor', 'Other'],
      message: '{VALUE} is not a valid category'
    },
    index: true
  },
  specifications: {
    type: Map,
    of: String,
    default: {}
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  featured: {
    type: Boolean,
    default: false,
    index: true
  },
  discount: {
    type: Number,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%'],
    default: 0
  },
  salePrice: {
    type: Number,
    min: [0, 'Sale price cannot be negative'],
    validate: {
      validator: function(v) {
        // Sale price must be less than regular price
        return v <= this.price;
      },
      message: 'Sale price cannot exceed regular price'
    }
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

// Indexes for faster queries
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });

// Virtual for final price (after discount)
productSchema.virtual('finalPrice').get(function() {
  if (this.salePrice && this.salePrice > 0) {
    return this.salePrice;
  }
  if (this.discount && this.discount > 0) {
    return this.price * (1 - this.discount / 100);
  }
  return this.price;
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.salePrice && this.salePrice > 0) {
    return Math.round(((this.price - this.salePrice) / this.price) * 100);
  }
  return this.discount;
});

// Virtual for inStock status
productSchema.virtual('inStock').get(function() {
  return this.stock > 0;
});

// Virtual for lowStock status
productSchema.virtual('lowStock').get(function() {
  return this.stock > 0 && this.stock <= 5;
});

// Set virtuals to true when converting to JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Update timestamp before update
productSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// Auto-generate ID if not provided
productSchema.pre('save', function(next) {
  if (!this.id) {
    // Generate ID from category and timestamp
    const prefix = this.category.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    this.id = `${prefix}-${timestamp}`;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);