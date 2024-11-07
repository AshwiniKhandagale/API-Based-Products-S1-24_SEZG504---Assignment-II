const User = require('../models/User');
const Restaurants = require('../models/Restaurant');
const Delivery = require('../models/Delivery');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');  
const Menu = require('../models/Menu');  
//const { performanceReport } = require('../utils/reportGenerator');

// Manage Users (Create, Update, Deactivate)
exports.createUser = async (req, res) => {
    try {
        const { role, email, password, profile } = req.body;

        // Validate role against schema
        if (!['Customer', 'Restaurant Owner', 'Delivery Personnel', 'Administrator'].includes(role)) {
            return res.status(400).send('Invalid role specified');
        }

        // Hash the password before saving it
        const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

        // Create user data
        const newUserData = {
            email,
            password: hashedPassword, // Save the hashed password
            role,
            profile
        };

        // Create a new User based on the specified role
        const newUser = new User(newUserData);
    
        await newUser.save();
        res.status(201).send({ message: `${role} created successfully`, user: newUser });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send({ error: 'Error creating user' });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { role, updates } = req.body;  // updates are the fields that should be updated
        const userId = req.params.id;
        let updatedUser;
        
        if (role === 'Customer') {
            updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });
        } else if (role === 'Restaurant Owner') {
            updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });
        } else if (role === 'Delivery Personnel') {
            updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });
        } else {
            return res.status(400).send('Invalid role specified');
        }
        
        if (!updatedUser) return res.status(404).send('User not found');
        res.send({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        res.status(500).send({ error: 'Error updating user' });
    }
};

exports.deactivateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const { role } = req.body;
        
        let deactivatedUser;
        
        if (role === 'Customer') {
            deactivatedUser = await User.findByIdAndUpdate(userId, { isActive: false }, { new: true });
        } else if (role === 'Restaurant Owner') {
            deactivatedUser = await User.findByIdAndUpdate(userId, { isActive: false }, { new: true });
        } else if (role === 'Delivery Personnel') {
            deactivatedUser = await User.findByIdAndUpdate(userId, { isActive: false }, { new: true });
        } else {
            return res.status(400).send('Invalid role specified');
        }
        
        if (!deactivatedUser) return res.status(404).send('User not found');
        res.send({ message: 'User deactivated successfully', user: deactivatedUser });
    } catch (error) {
        res.status(500).send({ error: 'Error deactivating user' });
    }
};

// View and Manage Orders
exports.viewOrders = async (req, res) => {
    try {
        const orders = await Order.find();  // Retrieve all orders from the system
        res.send(orders);
    } catch (error) {
        res.status(500).send({ error: 'Error retrieving orders' });
    }
};



exports.manageOrder = async (req, res) => {
    try {
        const orderId = req.params.id.trim();
        console.log("Order ID:",orderId);
        const { status, scheduledTime } = req.body; // Expecting 'status' for cancel or reschedule with 'scheduledTime' for reschedule

        const updateFields = {};

        // Check for cancellation or rescheduling
        if (status === 'cancelled') {
            updateFields.status = 'cancelled';
        } else if (scheduledTime) {
            updateFields.status = 'rescheduled';
            updateFields.scheduledTime = scheduledTime;
        } else {
            return res.status(400).send({ error: 'Please specify either cancellation or a valid scheduled time.' });
        }
        //console.log("Order ID type:", typeof orderId); 
        // Validate order ID format
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).send({ error: 'Invalid Order ID format' });
        }

        // Attempt to update the order
        const updatedOrder = await Order.findByIdAndUpdate(orderId, updateFields, { new: true });

        if (!updatedOrder) {
            console.error(`Order with ID ${orderId} not found`);
            return res.status(404).send({ error: 'Order not found' });
        }

        res.send({ message: 'Order updated successfully', order: updatedOrder });
    } catch (error) {
        console.error("Detailed Error updating order:", error); // Logs the exact error for easier debugging
        res.status(500).send({ error: 'Error updating order' });
    }
};

exports.generatePopularRestaurantsReport = async (req, res) => {
    try {
        const results = await OrderItem.aggregate([
            {
                $group: {
                    _id: { restaurant_id: "$restaurant_id", menu_id: "$menu_id" },
                    orderCount: { $sum: "$quantity" }
                }
            },
            { $sort: { orderCount: -1 } },
            {
                $group: {
                    _id: "$_id.restaurant_id",
                    mostOrderedDish: { $first: "$_id.menu_id" },
                    orderCount: { $first: "$orderCount" }
                }
            }
        ]);

        // Using populate to fetch restaurant and menu details
        const popularRestaurants = await Promise.all(results.map(async (result) => {
            // Populate restaurant name and menu name using populate()
            const restaurant = await Restaurants.findById(result._id);
            const menu = await Menu.findById(result.mostOrderedDish);

            if (!restaurant || !menu) {
                // If the restaurant or menu is not found, return a default value or skip it
                return {
                    restaurantName: restaurant ? restaurant.name : 'Unknown Restaurant',
                    mostOrderedDish: {
                        name: menu ? menu.name : 'Unknown Dish',
                        orderCount: result.orderCount
                    }
                };
            }

            // If both restaurant and menu are found, return the correct details
            return {
                restaurantName: restaurant.name,
                mostOrderedDish: {
                    name: menu.name,
                    orderCount: result.orderCount
                }
            };
        }));

        res.send({
            popularRestaurants
        });
    } catch (error) {
        console.error("Error generating popular restaurants report:", error);
        res.status(500).send({ error: "Error generating popular restaurants report" });
    }
};

    
// Monitor Platform Activity
exports.monitorActivity = async (req, res) => {
    try {
        const activeCustomersCount = await User.countDocuments({ isActive: true, role: 'Customer' });
        const activeRestaurantOwnersCount = await User.countDocuments({ isActive: true, role: 'Restaurant Owner' });
        const activeDeliveryPersonnelCount = await User.countDocuments({ isActive: true, role: 'Delivery Personnel' });
        const activeAdministratorsCount = await User.countDocuments({ isActive: true, role: 'Administrator' }); // Optional

        // Count active restaurants
        const activeRestaurantsCount = await Restaurants.countDocuments({});

        // Count active orders based on the desired statuses
        const activeOrdersCount = await Order.countDocuments({ status: { $in: ['placed', 'preparing', 'out for delivery'] } });

        const platformStatus = {
            activeCustomers: activeCustomersCount,
            activeRestaurantOwners: activeRestaurantOwnersCount,
            activeDeliveryPersonnel: activeDeliveryPersonnelCount,
            activeAdministrators: activeAdministratorsCount, // Optional
            activeRestaurants: activeRestaurantsCount,
            activeOrders: activeOrdersCount
        };

        res.send(platformStatus);
    } catch (error) {
        res.status(500).send({ error: 'Error monitoring platform activity' });
    }
};