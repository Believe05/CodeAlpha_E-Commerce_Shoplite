
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  items: [
    {
      productId: { 
        type: String, 
        required: true 
      },
      name: { 
        type: String, 
        required: true,
        trim: true
      },
      price: { 
        type: Number, 
        required: true,
        min: [0, 'Price cannot be negative']
      },
      quantity: { 
        type: Number, 
        required: true,
        min: [1, 'Quantity must be at least 1']
      },
      itemTotal: {
        type: Number,
        default: function() {
          return this.price * this.quantity;
        }
      }
    }
  ],
  subtotal: { 
    type: Number, 
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  tax: { 
    type: Number, 
    default: 0,
    min: [0, 'Tax cannot be negative']
  },
  shippingCost: { 
    type: Number, 
    default: 0,
    min: [0, 'Shipping cost cannot be negative']
  },
  total: { 
    type: Number, 
    required: true,
    min: [0, 'Total cannot be negative']
  },
  shipping: {
    address: { 
      type: String, 
      required: true,
      trim: true
    },
    city: { 
      type: String, 
      required: true,
      trim: true
    },
    postalCode: { 
      type: String, 
      required: true,
      trim: true
    },
    country: {
      type: String,
      default: 'South Africa',
      trim: true
    }
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending',
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['Credit Card', 'PayPal', 'EFT', 'Cash on Delivery'],
    default: 'Credit Card'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

// Calculate totals before saving
orderSchema.pre('save', function(next) {
  // Calculate item totals
  this.items.forEach(item => {
    item.itemTotal = item.price * item.quantity;
  });
  
  // Calculate subtotal
  this.subtotal = this.items.reduce((sum, item) => sum + item.itemTotal, 0);
  
  // Calculate total if not set
  if (!this.total) {
    this.total = this.subtotal + this.tax + this.shippingCost;
  }
  
  next();
});

// Update timestamp on update
orderSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model('Order', orderSchema);