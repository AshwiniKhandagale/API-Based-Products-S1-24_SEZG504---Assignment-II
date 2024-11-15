const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const createError = require('http-errors');

const authMiddleware = (requiredRole) => (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return next(createError(401, 'Access denied. No token provided.'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check for token expiration
    if (Date.now() >= decoded.exp * 1000) {
      return next(createError(401, 'Access denied. Token expired.'));
    }

    // Attach decoded user information to req.user
    req.user = decoded;

    // Check for required role if one is specified
    if (requiredRole && decoded.role !== requiredRole) {
      return next(createError(403, 'Access denied. Insufficient permissions.'));
    }

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return next(createError(400, 'Invalid token'));
  }
};

// To compare hashed password during login (example):
const comparePasswords = async (enteredPassword, storedHashedPassword) => {
  const isMatch = await bcrypt.compare(enteredPassword, storedHashedPassword);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }
};

module.exports = authMiddleware;