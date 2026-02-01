
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET is not set in environment variables');
  process.exit(1);
}

const authMiddleware = {
  // Verify token for regular users
  verifyToken: (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        error: 'No token provided' 
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Token format: Bearer <token>' 
      });
    }
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      req.userId = decoded.userId;
      next();
    } catch (error) {
      console.error("Token verification error:", error.message);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false,
          error: 'Token expired' 
        });
      }
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false,
          error: 'Invalid token' 
        });
      }
      
      res.status(401).json({ 
        success: false,
        error: 'Authentication failed' 
      });
    }
  },
  
  // Verify token for admin users
  verifyAdmin: (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        error: 'No token provided' 
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Check if user has admin role
      if (decoded.role !== 'admin') {
        return res.status(403).json({ 
          success: false,
          error: 'Admin access required' 
        });
      }
      
      req.user = decoded;
      req.userId = decoded.userId;
      next();
    } catch (error) {
      console.error("Admin token verification error:", error.message);
      res.status(401).json({ 
        success: false,
        error: 'Authentication failed' 
      });
    }
  }
};

module.exports = authMiddleware;