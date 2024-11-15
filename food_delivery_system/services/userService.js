const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const createError = require('http-errors');

const registerUser = async (userData) => {
    const { email, password, role, profile } = userData;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw createError(400, 'Email already in use');
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Role-specific validations for the profile
    if (role === 'Delivery Personnel') {
        if (!profile.vehicleType) {
            throw createError(400, 'Vehicle type is required for Delivery Personnel');
        }
    }

    if (role === 'Customer') {
        if (!profile.deliveryAddress || !profile.deliveryAddress.street || !profile.deliveryAddress.city || !profile.deliveryAddress.postalCode || !profile.deliveryAddress.country) {
            throw createError(400, 'Complete delivery address is required for Customers');
        }
    }

    if (role === 'Restaurant Owner') {
        if (!profile.restaurantDetails) {
            throw createError(400, 'Restaurant details are required for Restaurant Owners');
        }
        const { restaurantName, restaurantAddress, hoursOfOperation } = profile.restaurantDetails;
        if (!restaurantName || !restaurantAddress || !hoursOfOperation) {
            throw createError(400, 'Restaurant name, address, and hours of operation are required for Restaurant Owners');
        }
    }

    // Create a new user with profile information
    const user = new User({
        email,
        password: hashedPassword,
        role,
        profile
    });

    await user.save();

    return user;
};

const loginUser = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw createError(400, 'Invalid email or password');
    }

    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw createError(400, 'Invalid email or password');
    }

    // Generate a JWT token
    const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' } // Token expiration time
    );

    return token;
};

module.exports = {
    registerUser,
    loginUser
};
