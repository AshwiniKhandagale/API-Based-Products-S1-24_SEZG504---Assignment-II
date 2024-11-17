const jwt = require('jsonwebtoken');
const createError = require('http-errors');

// Middleware to authenticate the JWT token and check user role
const authMiddleware = (requiredRole) => (req, res, next) => {
  // Get the token from the Authorization header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // If no token is provided, deny access
  if (!token) {
    return next(createError(401, 'Access denied. No token provided.'));
  }

  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded user information to req.user
    req.user = decoded;

    // Check for required role, if a role is specified in the route
    if (requiredRole && decoded.role !== requiredRole) {
      return next(createError(403, 'Access denied. Insufficient permissions.'));
    }

    // Proceed to the next middleware/route handler
    next();
  } catch (error) {
    console.error('Token verification error:', error);

    // Catch errors related to invalid or expired tokens
    if (error.name === 'TokenExpiredError') {
      return next(createError(401, 'Access denied. Token expired.'));
    }
    
    // For any other errors (invalid token, etc.)
    return next(createError(400, 'Invalid token'));
  }
};

// To compare hashed password during login (example):
const comparePasswords = async (enteredPassword, storedHashedPassword) => {
  const bcrypt = require('bcryptjs');
  const isMatch = await bcrypt.compare(enteredPassword, storedHashedPassword);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }
};

module.exports = authMiddleware;
