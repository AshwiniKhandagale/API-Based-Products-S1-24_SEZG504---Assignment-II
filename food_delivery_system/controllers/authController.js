const { registerUser, loginUser } = require('../services/userService');
const { validationResult } = require('express-validator');
const createError = require('http-errors');

exports.register = async (req, res, next) => {
    // Validation errors check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(createError(400, 'Invalid input: ' + errors.array().map(err => err.msg).join(', ')));
    }

    const { email, password, role, profile } = req.body;

    try {
        // Register the user with the provided details
        const user = await registerUser({
            email,
            password,
            role,
            profile
        });

        // Respond with a success message and the user data (excluding password)
        const userResponse = {
            email: user.email,
            role: user.role,
            profile: user.profile
        };

        res.status(201).json({ message: 'User registered successfully', user: userResponse });
    } catch (error) {
        next(error); // Forward error to error handler
    }
};

exports.login = async (req, res, next) => {
    // Destructure the login credentials from the request body
    const { email, password } = req.body;

    try {
        // Attempt to login and obtain JWT token
        const token = await loginUser(email, password);

        // Respond with the JWT token
        res.json({ token });
    } catch (error) {
        // If login fails, pass error to the error handler
        next(error);
    }
};
