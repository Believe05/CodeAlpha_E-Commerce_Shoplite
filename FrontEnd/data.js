// data.js - Product data loading
const API_BASE = 'http://localhost:5000/api';

// Global variable for products
window.PRODUCTS = [];

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
    if (result.success) {
      window.PRODUCTS = result.data || [];
      console.log(`Successfully loaded ${window.PRODUCTS.length} products from backend`);
    } else {
      throw new Error(result.error || 'Failed to load products');
    }
    
  } catch (err) {
    console.error("Failed to load products from backend:", err);
    
    // Use fallback products
    window.PRODUCTS = getFallbackProducts();
    console.log("Using fallback products:", window.PRODUCTS.length);
  }
  
  // Dispatch event that products are loaded
  document.dispatchEvent(new Event('productsLoaded'));
  
  return window.PRODUCTS;
}

// Fallback products in case API fails
function getFallbackProducts() {
  return [
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
      image: "images/camera1.jpg",
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
      image: "images/headphones1.jpg",
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
      image: "images/laptop2.jpg",
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
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing...');
  
  // First, load products
  loadProducts().then(products => {
    console.log('Products loaded:', products.length);
    
    // Then update filters and render if on home page
    if (window.location.pathname.includes('index.html') || 
        window.location.pathname === '/' || 
        window.location.pathname.endsWith('/')) {
      
      updateFilters();
      
      // Check if renderProducts function exists and call it
      if (typeof renderProducts === 'function') {
        console.log('Calling renderProducts...');
        setTimeout(() => renderProducts(), 100);
      } else {
        console.error('renderProducts function not found!');
        // Try to render directly
        renderProductsDirectly();
      }
    }
  }).catch(error => {
    console.error('Failed to load products:', error);
  });
});

// Direct rendering function as fallback
function renderProductsDirectly() {
  const container = document.getElementById('productGrid');
  if (!container || !window.PRODUCTS || window.PRODUCTS.length === 0) {
    console.log('No container or products found');
    return;
  }
  
  console.log('Direct rendering of products:', window.PRODUCTS.length);
  
  container.innerHTML = window.PRODUCTS.map(product => `
    <div class="product-card" data-id="${product._id || product.id}">
      <a href="product.html?id=${product._id || product.id}">
        <img src="${product.image || 'https://via.placeholder.com/300x200?text=No+Image'}" 
             alt="${product.name}" 
             class="product-image"
             onerror="this.onerror=null; this.src='https://via.placeholder.com/300x200?text=Image+Not+Found'">
      </a>
      <h3><a href="product.html?id=${product._id || product.id}">${product.name}</a></h3>
      <p class="brand">${product.brand || 'Unknown Brand'}</p>
      <p class="description">${product.short || (product.description ? product.description.substring(0, 80) : 'No description')}...</p>
      <div class="price">R${product.price ? product.price.toFixed(2) : '0.00'}</div>
      <div class="rating">⭐ ${product.rating || 4.0}</div>
      <button onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')}, 1)" 
              class="btn primary add-to-cart">
        Add to Cart
      </button>
    </div>
  `).join('');
  
  // Hide loading message
  const loadingElement = document.querySelector('.loading-products');
  if (loadingElement) {
    loadingElement.style.display = 'none';
  }
}

function updateFilters() {
  console.log('Updating filters with products:', window.PRODUCTS?.length);
  
  // Update category dropdown
  const categorySelect = document.getElementById("categorySelect");
  if (categorySelect && window.PRODUCTS && window.PRODUCTS.length > 0) {
    const categories = [...new Set(window.PRODUCTS.map(p => p.category).filter(Boolean))];
    console.log('Available categories:', categories);
    
    categorySelect.innerHTML = '<option value="">All Categories</option>' + 
      categories.map(cat => `<option value="${cat}">${cat}</option>`).join("");
    
    // Check for URL category parameter
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam && categories.includes(categoryParam)) {
      categorySelect.value = categoryParam;
      console.log('Applied category filter from URL:', categoryParam);
    }
  }
  
  // Update brand dropdown
  const brandSelect = document.getElementById("brandSelect");
  if (brandSelect && window.PRODUCTS && window.PRODUCTS.length > 0) {
    const brands = [...new Set(window.PRODUCTS.map(p => p.brand).filter(Boolean))];
    console.log('Available brands:', brands);
    
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
      e.target.onerror = null;
    }
  }, true);
}

// Make functions globally available
window.loadProducts = loadProducts;
window.updateFilters = updateFilters;
window.renderProductsDirectly = renderProductsDirectly;
window.getFallbackProducts = getFallbackProducts;
window.retryLoadProducts = function() {
  console.log('Retrying to load products...');
  loadProducts().then(() => {
    if (typeof renderProducts === 'function') {
      renderProducts();
    } else {
      renderProductsDirectly();
    }
  });
};

// Initialize image fallback
addImageFallback();