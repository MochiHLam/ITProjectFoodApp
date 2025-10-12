const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization || req.cookies.token;
  let token;
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (typeof authHeader === 'string') {
    token = authHeader;
  }
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}

// Middleware to check if user still exists and is active
async function validateUserExists(req, res, next) {
  try {
    console.log('validateUserExists: Checking user ID:', req.user.id);
    const user = await User.findById(req.user.id);
    console.log('validateUserExists: Found user:', user ? 'YES' : 'NO', user?.isActive ? 'ACTIVE' : 'INACTIVE');
    
    if (!user || !user.isActive) {
      console.log('validateUserExists: User not found or inactive, returning 401');
      return res.status(401).json({ message: 'User account has been deactivated or deleted' });
    }
    req.user = { ...req.user, user };
    next();
  } catch (err) {
    console.log('validateUserExists: Error:', err.message);
    return res.status(401).json({ message: 'User validation failed' });
  }
}

module.exports = { authenticateJWT, authorizeRoles, validateUserExists };



