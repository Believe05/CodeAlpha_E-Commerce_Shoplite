// Authentication forms only
const API_BASE = 'http://localhost:5000/api';

// Show message - only for login/register pages
function showMessage(elementId, message, type = 'success') {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  element.textContent = message;
  element.className = `message ${type}`;
  element.style.display = 'block';
  
  if (type === 'success') {
    setTimeout(() => {
      element.style.display = 'none';
    }, 3000);
  }
}

// Save user data (only for login/register success)
function saveUserData(user, token) {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('token', token);
}

// Register form handler
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userData = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim().toLowerCase(),
      password: document.getElementById('password').value
    };

    // Validation
    if (!userData.name || userData.name.length < 2) {
      showMessage('message', 'Name must be at least 2 characters', 'error');
      return;
    }
    
    if (!userData.email || !userData.email.includes('@')) {
      showMessage('message', 'Valid email is required', 'error');
      return;
    }
    
    if (!userData.password || userData.password.length < 6) {
      showMessage('message', 'Password must be at least 6 characters', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const result = await response.json();

      if (response.ok) {
        saveUserData(result.user, result.token);
        showMessage('message', 'Registration successful! Redirecting...', 'success');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
      } else {
        showMessage('message', result.error || 'Registration failed', 'error');
      }
    } catch (error) {
      console.error('Registration error:', error);
      showMessage('message', 'Network error. Please try again.', 'error');
    }
  });
}

// Login form handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userData = {
      email: document.getElementById('email').value.trim().toLowerCase(),
      password: document.getElementById('password').value
    };

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const result = await response.json();

      if (response.ok) {
        saveUserData(result.user, result.token);
        showMessage('message', 'Login successful! Redirecting...', 'success');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
      } else {
        showMessage('message', result.error || 'Login failed', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      showMessage('message', 'Network error. Please try again.', 'error');
    }
  });
}

