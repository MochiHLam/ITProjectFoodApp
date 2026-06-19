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
    const user = await User.findById(req.user.id)
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User account has been deactivated or deleted' })
    }
    req.user = { ...req.user, user }
    next()
  } catch (err) {
    return res.status(401).json({ message: 'User validation failed' })
  }
}

module.exports = { authenticateJWT, authorizeRoles, validateUserExists };



