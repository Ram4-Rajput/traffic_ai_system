const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user to ensure they still exist
    const user = await User.findOne({ user_id: decoded.userId });
    if (!user) {
      return res.status(401).json({
        error: 'Invalid token. User not found.'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        error: 'Account is deactivated.'
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired.'
      });
    }

    res.status(500).json({
      error: 'Authentication error.',
      message: error.message
    });
  }
};

module.exports = auth;
