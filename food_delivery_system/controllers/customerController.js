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
        const { customer_id, restaurant_name, items } = req.body;

        // Validate restaurant and menu items by name
        // Find restaurant by name
        const restaurant = await Restaurant.findOne({ name: restaurant_name });

        if (!restaurant) {
            return res.status(400).send('Restaurant not found.');
        }

        // Find menu items by name and restaurant
        const menuItems = await Menu.find({
            name: { $in: items.map(item => item.menu_name) }, // Using menu_name instead of menu_id
            restaurant_id: restaurant._id  // Use the restaurant's ObjectId to filter
        });

        // Check if all menu items are valid
        if (menuItems.length !== items.length) {
            return res.status(400).send('Some menu items are invalid or not available in this restaurant.');
        }

        // Create Order Items
        const orderItems = await Promise.all(
            items.map(async (item) => {
                const menuItem = menuItems.find(menu => menu.name === item.menu_name);
                if (!menuItem) {
                    throw new Error(`Menu item '${item.menu_name}' not found.`);
                }
                const orderItem = new OrderItem({
                    order_id: null,  // Will be updated after the order is created
                    customer_id,
                    restaurant_id: restaurant._id,
                    menu_id: menuItem._id,  // Use the menu item ObjectId
                    quantity: item.quantity,
                    price: menuItem.price * item.quantity,
                    status: 'ordered',
                });
                await orderItem.save();
                return orderItem;
            })
        );

        // Optionally, you can create an order record here after saving all order items

        res.status(201).send('Order placed successfully!');
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).send('An error occurred while placing the order.');
    }
};


// Track an order
const trackOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId).populate('restaurant').populate('items.menu');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({
            orderStatus: order.status,
            estimatedDeliveryTime: order.estimatedDeliveryTime,
            restaurant: order.restaurant,
            items: order.items
        });
    } catch (error) {
        res.status(500).json({ message: 'Error tracking order', error });
    }
};

// View order history
const viewOrderHistory = async (req, res) => {
    try {
        const customer_id = req.user.id; // Assuming the auth middleware attaches the user ID
        const orders = await Order.find({ customer_id }).populate('restaurant').populate('items.menu');
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
