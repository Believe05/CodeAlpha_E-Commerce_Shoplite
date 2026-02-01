// data.js - Product data loading
const API_BASE = 'http://localhost:5000/api';

// Sample products (IDs must be unique) - WITH CORRECT IMAGE PATHS FROM YOUR FOLDER
window.PRODUCTS = [
  {
    id: "lap-001",
    name: "ZenBook Pro 15",
    brand: "ASUS",
    price: 24999.00,
    image: "images/asus2.jpg",  // Changed from laptop1.jpg to asus2.jpg
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
    image: "images/camera1.jpg",  // Changed from phone1.jpg to camera1.jpg
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
    image: "images/headphones3.jpg",  // Correct - headphones3.jpg
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
    image: "images/Mac4.jpg",  // Changed from laptop2.jpg to Mac4.jpg
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
    image: "images/mouse1.jpg",  // This one is correct
    short: "Ergonomic precision mouse.",
    description: "Silent clicks, MagSpeed wheel, multi-device. Great for coding and design.",
    rating: 4.6,
    stock: 25,
    category: "Accessory"
  }
];

// Load products dynamically from backend API
async function loadProducts() {
  try {
    console.log("Attempting to load products from backend...");
    
    const res = await fetch(`${API_BASE}/products`, {
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    console.log("Response status:", res.status, res.statusText);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const result = await res.json();
    window.PRODUCTS = result.data || result;
    console.log(`Successfully loaded ${window.PRODUCTS.length} products from backend`);
    
    // Dispatch event to notify app.js that products are loaded
    document.dispatchEvent(new CustomEvent('productsLoaded'));
    
  } catch (err) {
    console.error("Failed to load products from backend:", err);
    
    // Use pre-defined sample products as fallback
    console.log("Using fallback sample products");
    // window.PRODUCTS is already defined above with correct paths
    
    // Dispatch event even with fallback products
    document.dispatchEvent(new CustomEvent('productsLoaded'));
  }
  
  // Call appropriate render function based on current page
  renderCurrentPage();
  
  // Update category and brand filters
  updateFilters();
  
  return window.PRODUCTS;
}

// Function to render the current page based on URL
function renderCurrentPage() {
  const path = window.location.pathname;
  console.log("Current page path:", path);
  
  if (path.includes("cart.html")) {
    console.log("Detected cart page");
    if (typeof renderCart === 'function') {
      renderCart();
    } else {
      console.error("renderCart function not found!");
    }
  } else if (path.includes("checkout.html")) {
    console.log("Detected checkout page");
    if (typeof setupCheckout === 'function') {
      setupCheckout();
    }
  } else if (path.includes("product.html")) {
    console.log("Detected product page");
    if (typeof renderProductDetail === 'function') {
      renderProductDetail();
    }
  } else if (path.includes("index.html") || path === "/") {
    console.log("Detected home page");
    if (typeof renderProducts === 'function') {
      renderProducts();
    }
    if (typeof setupFilters === 'function') {
      setTimeout(() => setupFilters(), 100);
    }
  }
}

function updateFilters() {
  // Update category dropdown
  const categorySelect = document.getElementById("categorySelect");
  if (categorySelect && window.PRODUCTS) {
    const categories = [...new Set(window.PRODUCTS.map(p => p.category).filter(Boolean))];
    categorySelect.innerHTML = '<option value="">All Categories</option>' + 
      categories.map(cat => `<option value="${cat}">${cat}</option>`).join("");
    
    // Check for URL category parameter
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam && categories.includes(categoryParam)) {
      categorySelect.value = categoryParam;
      if (typeof applyFilters === 'function') {
        setTimeout(() => applyFilters(), 100);
      }
    }
  }
  
  // Update brand dropdown
  const brandSelect = document.getElementById("brandSelect");
  if (brandSelect && window.PRODUCTS) {
    const brands = [...new Set(window.PRODUCTS.map(p => p.brand).filter(Boolean))];
    brandSelect.innerHTML = '<option value="">All Brands</option>' + 
      brands.map(brand => `<option value="${brand}">${brand}</option>`).join("");
  }
}

// Helper function for image fallback
function addImageFallback() {
  document.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG') {
      console.error(`Image failed to load: ${e.target.src}`);
      e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
      e.target.onerror = null; // Prevent infinite loop
    }
  }, true);
}

// Make loadProducts available globally for debugging
window.loadProducts = loadProducts;

// Run when page loads
document.addEventListener("DOMContentLoaded", function() {
  addImageFallback();
  loadProducts();
});