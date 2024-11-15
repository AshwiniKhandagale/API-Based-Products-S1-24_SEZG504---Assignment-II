const Restaurant = require('../models/Restaurant');
const Menu = require('../models/Menu');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Delivery = require('../models/Delivery');
const Customer = require('../models/User');

// Browse restaurants
const browseRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.find();
        res.status(200).json(restaurants);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching restaurants', error });
    }
};

// Search menus
const searchMenus = async (req, res) => {
    try {
        const { search } = req.query;
        const menuItems = await Menu.find({
            name: { $regex: search, $options: 'i' }
        });
        res.status(200).json(menuItems);
    } catch (error) {
        res.status(500).json({ message: 'Error searching menu items', error });
    }
};

// Place an order and create a delivery record
const placeOrder = async (req, res) => {
    try {
       
        const customer_id = req.user.userId; // Access customer_id from authenticated user (via middleware)
        const { restaurant_name, items } = req.body;

        // Find restaurant by name
        const restaurant = await Restaurant.findOne({ name: restaurant_name });
        if (!restaurant) {
            return res.status(400).json({ message: 'Restaurant not found.' });
        }

        // Validate menu items
        const menuItems = await Menu.find({
            name: { $in: items.map(item => item.menu_name) },
            restaurant_id: restaurant.owner_id
        });

        if (menuItems.length !== items.length) {
            return res.status(400).json({ message: 'Some menu items are invalid or not available.' });
        }

        // Create the order with customer_id
        const newOrder = new Order({
            customer_id,
            restaurant_id: restaurant._id,
            status: 'placed',
            scheduledTime: null,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await newOrder.save();

        // Create order items
        const orderItems = await Promise.all(
            items.map(async (item) => {
                const menuItem = menuItems.find(menu => menu.name === item.menu_name);
                const orderItem = new OrderItem({
                    order_id: newOrder._id,
                    customer_id,
                    restaurant_id: restaurant._id,
                    menu_id: menuItem._id,
                    quantity: item.quantity,
                    price: menuItem.price * item.quantity,
                    status: 'ordered',
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                await orderItem.save();
                return {
                    id: orderItem._id,
                    menu_name: menuItem.name,
                    quantity: orderItem.quantity,
                    price_per_item: menuItem.price,
                    total_price: orderItem.price,
                    status: orderItem.status,
                    createdAt: orderItem.createdAt,
                    updatedAt: orderItem.updatedAt
                };
            })
        );

        // Respond with order details
        res.status(201).json({
            id: newOrder._id,
            customer_id: newOrder.customer_id,
            restaurant_id: newOrder.restaurant_id,
            status: newOrder.status,
            scheduledTime: newOrder.scheduledTime,
            createdAt: newOrder.createdAt,
            updatedAt: newOrder.updatedAt,
            order_items: orderItems
        });

    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ message: 'An error occurred while placing the order' });
    }
};


// Track an order
const trackOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        // Find the order and populate related fields
        const order = await Order.findById(orderId)
            .populate('restaurant_id', 'name address') // Populate restaurant details
            .populate({
                path: 'order_items', // Populate order items
                populate: {
                    path: 'menu_id', // Populate menu details within order items
                    select: 'name price' // Select specific fields for menu
                }
            });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Format response with detailed order and item data
        const response = {
            order_id: order._id,
            status: order.status,
            scheduledTime: order.scheduledTime,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            restaurant: {
                id: order.restaurant_id._id,
                name: order.restaurant_id.name,
                address: order.restaurant_id.address
            },
            items: order.order_items.map(item => ({
                id: item._id,
                menu_name: item.menu_id.name,
                quantity: item.quantity,
                price_per_item: item.menu_id.price,
                total_price: item.price,
                status: item.status,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt
            }))
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error tracking order:', error);
        res.status(500).json({ message: 'Error tracking order', error });
    }
};

// View order history
const viewOrderHistory = async (req, res) => {
    try {
        const customer_id = req.user.userId; // Assuming the auth middleware attaches the user ID
        const orders = await Order.find({ customer_id })
            .populate('restaurant_id', 'name address') // Populate restaurant details
            .populate({
                path: 'order_items',
                populate: {
                    path: 'menu_id',
                    select: 'name price' // Populate the menu items in the order history
                }
            });

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching order history', error });
    }
};

module.exports = {
    browseRestaurants,
    searchMenus,
    placeOrder,
    trackOrder,
    viewOrderHistory
};
