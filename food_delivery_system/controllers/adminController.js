const User = require('../models/User');
const Order = require('../models/Order');
const Restaurants = require('../models/Restaurant');
const Menu = require('../models/Menu');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Create a new user (Administrator only)
exports.createUser = async (req, res) => {
    try {
        const { role, email, password, profile } = req.body;

        // Validate role against schema
        if (!['Customer', 'Restaurant Owner', 'Delivery Personnel', 'Administrator'].includes(role)) {
            return res.status(400).send('Invalid role specified');
        }

        // Check if password is provided
        if (!password) {
            return res.status(400).send('Password is required');
        }

        // Hash the password before saving it
        const saltRounds = 10;  // Specify the salt rounds explicitly
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user data
        const newUserData = {
            email,
            password: hashedPassword, // Save the hashed password
            role,
            profile
        };

        // Create a new User
        const newUser = new User(newUserData);

        await newUser.save();
        res.status(201).send({ message: `${role} created successfully`, user: newUser });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send({ error: 'Error creating user' });
    }
};


// Update user details (Administrator only)
exports.updateUser = async (req, res) => {
    try {
        const { role, updates } = req.body;
        const userId = req.params.id;
        let updatedUser;
        
        updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });

        if (!updatedUser) return res.status(404).send('User not found');
        res.send({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        res.status(500).send({ error: 'Error updating user' });
    }
};

// Deactivate user (Administrator only)
exports.deactivateUser = async (req, res) => {
    try {
        const userId = req.params.id;

        const deactivatedUser = await User.findByIdAndUpdate(userId, { isActive: false }, { new: true });

        if (!deactivatedUser) return res.status(404).send('User not found');
        res.send({ message: 'User deactivated successfully', user: deactivatedUser });
    } catch (error) {
        res.status(500).send({ error: 'Error deactivating user' });
    }
};

// View all orders (Administrator only)
exports.viewOrders = async (req, res) => {
    try {
        const orders = await Order.find(); 
        res.send(orders);
    } catch (error) {
        res.status(500).send({ error: 'Error retrieving orders' });
    }
};

// Manage order status (Administrator only)
exports.manageOrder = async (req, res) => {
    try {
        const orderId = req.params.id.trim();
        const { status, scheduledTime } = req.body;

        const updateFields = {};

        if (status === 'cancelled') {
            updateFields.status = 'cancelled';
        } else if (scheduledTime) {
            updateFields.status = 'rescheduled';
            updateFields.scheduledTime = scheduledTime;
        } else {
            return res.status(400).send({ error: 'Please specify either cancellation or a valid scheduled time.' });
        }

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).send({ error: 'Invalid Order ID format' });
        }

        const updatedOrder = await Order.findByIdAndUpdate(orderId, updateFields, { new: true });

        if (!updatedOrder) {
            return res.status(404).send({ error: 'Order not found' });
        }

        res.send({ message: 'Order updated successfully', order: updatedOrder });
    } catch (error) {
        res.status(500).send({ error: 'Error updating order' });
    }
};

// Generate report of popular restaurants (Administrator only)
exports.generatePopularRestaurantsReport = async (req, res) => {
    try {
        const results = await Order.aggregate([
            {
                $group: {
                    _id: "$restaurant_id",
                    orderCount: { $sum: "$quantity" }
                }
            },
            { $sort: { orderCount: -1 } },
            {
                $limit: 10 // Limit to top 10 restaurants
            }
        ]);

        const popularRestaurants = await Promise.all(results.map(async (result) => {
            const restaurant = await Restaurants.findById(result._id);

            if (!restaurant) {
                return { restaurantName: 'Unknown Restaurant', orderCount: result.orderCount };
            }

            return { restaurantName: restaurant.name, orderCount: result.orderCount };
        }));

        res.send({ popularRestaurants });
    } catch (error) {
        res.status(500).send({ error: "Error generating popular restaurants report" });
    }
};

// Monitor platform activity (Administrator only)
exports.monitorActivity = async (req, res) => {
    try {
        const activeCustomers = await User.countDocuments({ isActive: true, role: 'Customer' });
        const activeRestaurantOwners = await User.countDocuments({ isActive: true, role: 'Restaurant Owner' });
        const activeDeliveryPersonnel = await User.countDocuments({ isActive: true, role: 'Delivery Personnel' });
        const activeAdministrators = await User.countDocuments({ isActive: true, role: 'Administrator' });

        const activeRestaurants = await Restaurants.countDocuments({});
        const activeOrders = await Order.countDocuments({ status: { $in: ['placed', 'preparing', 'out-for-delivery'] } });

        res.send({
            activeCustomers,
            activeRestaurantOwners,
            activeDeliveryPersonnel,
            activeAdministrators,
            activeRestaurants,
            activeOrders
        });
    } catch (error) {
        res.status(500).send({ error: 'Error monitoring platform activity' });
    }
};
