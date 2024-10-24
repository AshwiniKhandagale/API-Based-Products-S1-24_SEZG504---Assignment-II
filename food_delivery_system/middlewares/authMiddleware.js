const jwt = require('jsonwebtoken');
const createError = require('http-errors');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) {
        return next(createError(401, 'Access denied. No token provided.'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        next(createError(400, 'Invalid token'));
    }
};

module.exports = authMiddleware;
