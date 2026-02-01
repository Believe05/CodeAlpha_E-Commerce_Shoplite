# ShopLite E-commerce Platform

### 📋 Overview
ShopLite is a full-stack e-commerce application built with a modern JavaScript stack, featuring a responsive frontend and a RESTful backend API. The platform allows users to browse products, manage a shopping cart, place orders, and track their purchases.

### 🏗️ Tech Stack
Frontend
HTML5/CSS3 - Responsive design with custom styling

Vanilla JavaScript - No frameworks, modular ES6+ code

LocalStorage - Client-side data persistence for cart and authentication

Backend
Node.js - Runtime environment

Express.js - Web framework

MongoDB - NoSQL database

Mongoose - ODM for MongoDB

JWT - Authentication and authorization

bcryptjs - Password hashing

### Key Features
. User authentication (register/login with JWT)
. Product catalog with filtering and sorting
. Shopping cart with local storage persistence
. Checkout process with order creation
. Order history and tracking
. Responsive design for all devices
. Toast notifications for user feedback

## 📁 Project Structure
text
shoplite/
├── frontend/
│   ├── index.html          # Home page
│   ├── product.html        # Product detail page
│   ├── cart.html           # Shopping cart page
│   ├── checkout.html       # Checkout page
│   ├── login.html          # Login page
│   ├── register.html       # Registration page
│   ├── orders.html         # Order history page
│   ├── styles.css          # Global styles
│   └── js/
│       ├── app.js          # Main application logic
│       ├── auth.js         # Authentication functions
│       ├── data.js         # Product data loading
│       └── orders.js       # Order management
│
├── backend/
│   ├── server.js           # Main server file
│   ├── db.js              # Database connection
│   ├── seed.js            # Database seeding script
│   ├── models/
│   │   ├── product.js     # Product schema
│   │   ├── user.js        # User schema
│   │   └── order.js       # Order schema
│   └── routes/
│       ├── productRoutes.js # Product API endpoints
│       ├── orderRoutes.js   # Order API endpoints
│       └── authRoutes.js    # Authentication endpoints
│
└── images/                # Product images

### 🚀 Getting Started
Prerequisites
Node.js (v14 or higher)

MongoDB (local or Atlas)

npm or yarn

Installation Steps
Clone the repository

## bash
git clone <repository-url>
cd shoplite
Set up environment variables
Create a .env file in the backend directory:

## env
MONGODB_URI=mongodb://localhost:27017/shoplite
JWT_SECRET=your-super-secret-Install backend dependencies

bash
cd backend
npm install
Seed the database

bash
npm run seed
# or
node seed.js
Start the backend server

bash
npm start
# or
node server.js
Start the frontend
Open the frontend directory in a browser or use a local server:

bash
# Using Python (if installed)
python -m http.server 8000
# or
npx serve frontend
Access the application

Frontend: http://localhost:8000 (or your chosen port)

Backend API: http://localhost:5000/api

API Health Check: http://localhost:5000/api/health

## 🔧 API Endpoints
Authentication
POST /api/auth/register - Register new user

POST /api/auth/login - User login

GET /api/auth/me - Get user profile (protected)

## Products
GET /api/products - Get all products (with filtering)

GET /api/products/:id - Get single product

GET /api/products/category/:category - Get products by category

POST /api/products - Create product (admin)

PUT /api/products/:id - Update product (admin)

DELETE /api/products/:id - Delete product (admin)

## Orders
POST /api/orders - Create new order (protected)

GET /api/orders - Get user's orders (protected)

GET /api/orders/:id - Get specific order (protected)

GET /api/orders/stats/summary - Get order statistics (protected)

## 🛒 Features in Detail
Shopping Cart
Add/remove products from cart

Update item quantities

Persistent cart using localStorage

Calculate totals including shipping

Product Browsing
Category filtering

Brand filtering

Price sorting (low to high, high to low)

Rating sorting

Search functionality

User Account
Secure registration and login

Order history

Shipping address management

Profile information

Checkout Process
Cart validation

Shipping information collection

Order confirmation

Order summary email (placeholder)

## 📱 Responsive Design
Mobile-first approach

Adaptive layouts for all screen sizes

Touch-friendly buttons and controls

Accessible navigation

## 🧪 Testing
The application can be tested with:

Test User Credentials (after seeding):

Email: test@example.com

Password: password123

API Testing:

Use Postman or curl to test endpoints

Check http://localhost:5000/api/test for connectivity

## 🔒 Security Features
Password hashing with bcrypt

JWT token authentication

Input validation and sanitization

CORS configuration

Rate limiting on API endpoints

Helmet.js for security headers

## 🐛 Troubleshooting
Common Issues
MongoDB Connection Failed

Ensure MongoDB is running locally or update the connection string in .env

For MongoDB Atlas: Update MONGODB_URI with your connection string

Port Already in Use

Change PORT in .env or kill the process using the port

On Linux/Mac: sudo lsof -ti:5000 | xargs kill

CORS Errors

Check the CORS configuration in server.js

Ensure frontend is being served from an allowed origin

Images Not Loading

Verify image paths in data.js

Check that images exist in the images/ directory

API Calls Failing

Check browser console for errors

Verify backend is running on port 5000

Check network tab for failed requests

Debug Tips
Open browser developer tools (F12)

Check console for JavaScript errors

Check network tab for API request failures

Verify localStorage contains user token after login

## 📄 License
This project is for educational purposes.

## 👥 Contributing
Fork the repository

Create a feature branch

Commit your changes

Push to the branch

Open a Pull Request

## 🙏 Acknowledgments
Product images from various sources

Icons from emoji library

Inspired by modern e-commerce platforms

## 📞 Support
For issues or questions:

Check the Troubleshooting section

Review the code comments

Create an issue in the repository

### Happy Shopping with ShopLite! 🛍️

jwt-key-here
PORT=5000
NODE_ENV=development

