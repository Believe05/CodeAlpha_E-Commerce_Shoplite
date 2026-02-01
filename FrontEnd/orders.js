// js/orders.js - CORRECTED VERSION
const API_BASE = 'http://localhost:5000/api';

// Check if user is logged in
function checkAuth() {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    return {
        user: user ? JSON.parse(user) : null,
        token: token || null
    };
}

async function loadOrders() {
  const container = document.getElementById('ordersList');
  if (!container) return;
  
  const { user, token } = checkAuth();
  
  // Redirect if not logged in
  if (!user || !token) {
    container.innerHTML = `
      <div style="padding: 40px; text-align: center;">
        <p>Please login to view your orders</p>
        <a href="login.html" class="btn primary">Login</a>
      </div>
    `;
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to load orders');
    }
    
    const result = await response.json();
    const orders = result.data || result;
    renderOrders(orders);
  } catch (error) {
    console.error('Error loading orders:', error);
    container.innerHTML = `
      <div style="padding: 20px; text-align: center; color: #dc3545;">
        <p>Failed to load orders: ${error.message}</p>
        <button class="btn" onclick="loadOrders()">Retry</button>
      </div>
    `;
  }
}

function renderOrders(orders) {
  const container = document.getElementById('ordersList');
  
  if (!orders || orders.length === 0) {
    container.innerHTML = `
      <div style="padding: 40px; text-align: center;">
        <p class="muted">You haven't placed any orders yet.</p>
        <a href="index.html" class="btn primary">Start Shopping</a>
      </div>
    `;
    return;
  }
  
  container.innerHTML = orders.map(order => {
    const orderDate = new Date(order.createdAt || order.date).toLocaleDateString();
    const orderTotal = order.total || order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
    
    return `
      <div class="order-card">
        <h3>Order #${order._id?.substring(0, 8) || 'N/A'}</h3>
        <p><strong>Date:</strong> ${orderDate}</p>
        <p><strong>Status:</strong> <span class="status ${order.status?.toLowerCase()}">${order.status || 'Pending'}</span></p>
        <p><strong>Total:</strong> R${orderTotal.toFixed(2)}</p>
        
        <h4>Items:</h4>
        <ul>
          ${(order.items || []).map(item => `
            <li>${item.name || 'Product'} × ${item.quantity} - R${(item.price * item.quantity).toFixed(2)}</li>
          `).join('')}
        </ul>
        
        ${order.shipping ? `
          <h4>Shipping Address:</h4>
          <p>${order.shipping.address}, ${order.shipping.city}, ${order.shipping.postalCode}</p>
        ` : ''}
      </div>
    `;
  }).join('');
}

// Add some CSS for status badges
if (!document.querySelector('#status-styles')) {
  const statusStyles = document.createElement('style');
  statusStyles.id = 'status-styles';
  statusStyles.textContent = `
    .status {
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
    }
    .status.pending { background: #ffc107; color: #000; }
    .status.processing { background: #17a2b8; color: #fff; }
    .status.shipped { background: #007bff; color: #fff; }
    .status.delivered { background: #28a745; color: #fff; }
    .status.cancelled { background: #dc3545; color: #fff; }
  `;
  document.head.appendChild(statusStyles);
}

// Make functions globally available
window.loadOrders = loadOrders;
window.renderOrders = renderOrders;

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadOrders);
} else {
  loadOrders();
}