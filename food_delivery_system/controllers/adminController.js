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
//exports.viewOrders = async (req, res) => {
  //  try {
    //    const orders = await Order.find(); 
      //  res.send(orders);
    //} catch (error) {
      //  res.status(500).send({ error: 'Error retrieving orders' });
    //}
//};

// View all orders (Administrator only)
// View all orders (Administrator only)
exports.viewOrders = async (req, res) => {
    try {
        // Fetch all orders, including those with null scheduledTime
        const orders = await Order.find();

        // Modify each order to remove the scheduledTime field if it's null
        const formattedOrders = orders.map(order => {
            // Remove the scheduledTime field if it's null
            if (order.scheduledTime === null) {
                order.scheduledTime = undefined;
            }
            return order;
        });

        res.send(formattedOrders);
    } catch (error) {
        res.status(500).send({ error: 'Error retrieving orders' });
    }
};





// Manage order status (Administrator only)
/*exports.manageOrder = async (req, res) => {
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
};*/
exports.manageOrder = async (req, res) => {
    try {
        const orderId = req.params.id.trim();
        const { status, scheduledTime } = req.body;

        const updateFields = {};

        // Handle order status and scheduled time updates
        if (status === 'cancelled') {
            updateFields.status = 'cancelled';
        } else if (scheduledTime) {
            updateFields.status = 'rescheduled';
            updateFields.scheduledTime = scheduledTime;
        } else {
            return res.status(400).send({ error: 'Please specify either cancellation or a valid scheduled time.' });
        }

        // Validate Order ID format
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).send({ error: 'Invalid Order ID format' });
        }

        // Update the order
        const updatedOrder = await Order.findByIdAndUpdate(orderId, updateFields, { new: true });

        if (!updatedOrder) {
            return res.status(404).send({ error: 'Order not found' });
        }

        // Prepare the response object
        const response = {
            message: 'Order updated successfully',
            order: {
                ...updatedOrder.toObject(),
            },
        };

        // Conditionally include the scheduledTime field if it's not null
        if (updatedOrder.scheduledTime === null) {
            delete response.order.scheduledTime;  // Remove the field if it's null
        }

        res.send(response);
    } catch (error) {
        res.status(500).send({ error: 'Error updating order' });
    }
};


// Generate report of popular restaurants (Administrator only)
// Generate report of popular restaurants and most ordered dishes (Administrator only)
exports.generatePopularRestaurantsReport = async (req, res) => {
    try {
        // Aggregating order data to get popular restaurants and most ordered dishes
        const results = await Order.aggregate([
            {
                $unwind: "$order_items"  // Unwind to break down each item in an order
            },
            {
                $lookup: {
                    from: "orderitems",  // The OrderItem collection name (should be lowercase)
                    localField: "order_items",
                    foreignField: "_id",
                    as: "order_item_details"
                }
            },
            {
                $unwind: "$order_item_details"  // Unwind the order items to get individual dish details
            },
            {
                $group: {
                    _id: {
                        restaurant_id: "$restaurant_id",  // Group by restaurant
                        dish_id: "$order_item_details.menu_id"  // Group by dish (menu_id)
                    },
                    totalQuantity: { $sum: "$order_item_details.quantity" }  // Sum up the quantity for each dish
                }
            },
            {
                $sort: { totalQuantity: -1 }  // Sort by quantity to get most ordered dishes
            },
            {
                $group: {
                    _id: "$_id.restaurant_id",  // Group by restaurant again
                    mostOrderedDish: { 
                        $first: { 
                            dish_id: "$_id.dish_id", 
                            orderCount: "$totalQuantity" 
                        } 
                    },
                    totalOrderCount: { $sum: "$totalQuantity" }  // Get total order count for the restaurant
                }
            },
            {
                $sort: { totalOrderCount: -1 }  // Sort by total orders for the restaurant
            },
            {
                $limit: 10  // Get the top 10 popular restaurants
            }
        ]);

        // Fetch restaurant details and dish details
        const popularRestaurants = await Promise.all(results.map(async (result) => {
            const restaurant = await Restaurants.findById(result._id);

            if (!restaurant) {
                return { restaurantName: 'Unknown Restaurant', orderCount: result.totalOrderCount, mostOrderedDish: null };
            }

            // Fetch dish details using menu_id
            const dish = await Menu.findById(result.mostOrderedDish.dish_id);

            return {
                restaurantName: restaurant.name,
                orderCount: result.totalOrderCount,
                mostOrderedDish: dish ? { name: dish.name, orderCount: result.mostOrderedDish.orderCount } : null
            };
        }));

        res.send({ popularRestaurants });
    } catch (error) {
        console.error("Error generating report:", error);
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
