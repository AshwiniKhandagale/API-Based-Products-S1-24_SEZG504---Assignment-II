const Restaurant = require('../models/Restaurant');
const Menu = require('../models/Menu');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Customer = require('../models/User');
const Delivery = require('../models/Delivery');
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
        const { customer_id, restaurant_id, items } = req.body;

        // Validate restaurant and menu items
        const menuItems = await Menu.find({ _id: { $in: items.map(item => item.menu_id) }, restaurant_id });

        if (menuItems.length !== items.length) {
            return res.status(400).send('Some menu items are invalid or not available in this restaurant.');
        }

        // Create Order Items
        const orderItems = await Promise.all(
            items.map(async (item) => {
                const menuItem = menuItems.find(menu => menu._id.toString() === item.menu_id);
                const orderItem = new OrderItem({
                    order_id: null,  // Will be updated after the order is created
                    customer_id,
                    restaurant_id,
                    menu_id: item.menu_id,
                    quantity: item.quantity,
                    price: menuItem.price * item.quantity,
                    status: 'ordered',
                });
                await orderItem.save();
                return orderItem;
            })
        );

        // Create Order with the items
        const totalPrice = orderItems.reduce((total, orderItem) => total + orderItem.price, 0);
        const newOrder = new Order({
            customer_id,
            restaurant_id,
            items: orderItems.map(item => item._id),  // This adds the OrderItem _id's to the Order document
            status: 'placed',
            scheduledTime: null,  // For now, no scheduled time
        });

        // Save the order
        await newOrder.save();

        // Update Order Items with the order ID
        await Promise.all(
            orderItems.map(async (orderItem) => {
                orderItem.order_id = newOrder._id;  // Now, we update the order_id reference in each OrderItem
                await orderItem.save();
            })
        );

        // Create a Delivery record for the order (status: 'pending', delivery_personnel_id: null)
        const delivery = new Delivery({
            order_id: newOrder._id,
            delivery_personnel_id: null,  // Initially null, delivery person will accept it later
            status: 'pending',  // Initial status is pending
            deliveryTime: 30,  // Set an estimated delivery time (in minutes)
        });

        // Save the delivery record
        await delivery.save();

        // Return response with the delivery ID as well
        res.status(201).send({
            message: 'Order placed successfully',
            orderId: newOrder._id,
            orderItems,
            deliveryId: delivery._id,
            totalPrice,
        });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).send({ error: 'Error placing order' });
    }
};

module.exports = { placeOrder };


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
        const orders = await Order.find({ customer: customer_id }).populate('restaurant').populate('items.menu');
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
