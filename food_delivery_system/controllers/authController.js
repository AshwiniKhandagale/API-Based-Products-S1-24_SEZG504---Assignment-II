const { registerUser, loginUser } = require('../services/userService');
const { validationResult } = require('express-validator');
const createError = require('http-errors');

exports.register = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(createError(400, 'Invalid input'));
    }

    try {
        const user = await registerUser(req.body);
        res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const token = await loginUser(req.body.email, req.body.password);
        res.json({ token });
    } catch (error) {
        next(error);
    }
};
