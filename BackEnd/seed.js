// seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/product');
const connectDB = require('./db'); // Use centralized connection

const products = [
  {
    id: "lap-001",
    name: "ZenBook Pro 15",
    brand: "ASUS",
    price: 24999.00,
    image: "images/laptop1.jpg",
    short: "Slim powerhouse for devs and creators.",
    description: "Intel i7, 16GB RAM, 1TB SSD, RTX 4060. Perfect for coding, content creation, and multitasking.",
    rating: 4.6,
    stock: 8,
    category: "Laptop"
  },
  {
    id: "phn-101",
    name: "Pixel 8 Pro",
    brand: "Google",
    price: 19999.00,
    image: "images/iPHONE13.jpg",
    short: "Flagship camera and clean Android.",
    description: "Pro-grade camera, Tensor chip, 120Hz display. Snappy, secure, and built for everyday brilliance.",
    rating: 4.7,
    stock: 12,
    category: "Smartphone"
  },
  {
    id: "hdp-501",
    name: "QuietComfort Ultra",
    brand: "Bose",
    price: 6999.00,
    image: "images/headphones3.jpg",
    short: "Noise-cancelling comfort for long focus.",
    description: "Adaptive noise cancellation, spatial audio, 24h battery. Ideal for study, travel, and deep work.",
    rating: 4.5,
    stock: 20,
    category: "Headphones"
  },
  {
    id: "lap-777",
    name: "MacBook Air M2",
    brand: "Apple",
    price: 28999.00,
    image: "images/mac5.jpg",
    short: "Effortless performance and battery life.",
    description: "M2 chip, 8GB RAM, 256GB SSD. Whisper-quiet, lightweight, and reliable for dev workflows.",
    rating: 4.8,
    stock: 5,
    category: "Laptop"
  },
  {
    id: "acc-220",
    name: "MX Master 3S",
    brand: "Logitech",
    price: 1799.00,
    image: "images/mouse1.jpg",
    short: "Ergonomic precision mouse.",
    description: "Silent clicks, MagSpeed wheel, multi-device. Great for coding and design.",
    rating: 4.6,
    stock: 25,
    category: "Accessory"
  }
];

async function seedDB() {
  try {
    // Connect to database
    await connectDB();
    
    console.log("🗑️  Clearing existing products...");
    const deleteResult = await Product.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} products`);
    
    console.log("🌱 Seeding database with products...");
    
    // Validate products before insertion
    const validProducts = products.filter(product => {
      if (!product.name || !product.price || product.price <= 0) {
        console.warn(`⚠️ Skipping invalid product: ${product.name || 'Unknown'}`);
        return false;
      }
      return true;
    });
    
    const inserted = await Product.insertMany(validProducts);
    console.log(`✅ Successfully seeded ${inserted.length} products!`);
    
    // Display seeded products
    console.log("\n📋 Seeded Products:");
    inserted.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - R${product.price.toFixed(2)} (Stock: ${product.stock})`);
    });
    
    // Show summary
    const categories = [...new Set(inserted.map(p => p.category))];
    console.log(`\n📊 Categories: ${categories.join(', ')}`);
    console.log(`💰 Total value: R${inserted.reduce((sum, p) => sum + (p.price * p.stock), 0).toFixed(2)}`);
    
  } catch (err) {
    console.error("❌ Seeding error:", err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    console.log("\n🔌 Closing MongoDB connection...");
    await mongoose.connection.close();
    console.log("✅ Seed script completed!");
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  seedDB();
}

module.exports = { products, seedDB }; // For testing