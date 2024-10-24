const createError = require('http-errors');

const errorHandler = (err, req, res, next) => {
    if (createError.isHttpError(err)) {
        res.status(err.status).json({ message: err.message });
    } else {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = errorHandler;
