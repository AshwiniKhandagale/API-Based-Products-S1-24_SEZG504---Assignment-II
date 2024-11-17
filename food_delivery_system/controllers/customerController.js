const Restaurant = require('../models/Restaurant');
const Menu = require('../models/Menu');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Delivery = require('../models/Delivery');
const Customer = require('../models/User');

async function fetchMenuById(menuId) {
    try {
        const menu = await Menu.findById(menuId).select('name price'); 
        return menu;
    } catch (error) {
        throw new Error(`Error fetching menu: ${error.message}`);
    }
}

// Browse restaurants
const browseRestaurants = async (req, res) => {
    try {
        // Fetch all restaurants
        const restaurants = await Restaurant.find();
        
        // If no restaurants found, return an empty array
        if (!restaurants || restaurants.length === 0) {
            return res.status(404).json({ message: 'No restaurants found.' });
        }

        // Iterate over restaurants and fetch menu details for each
        const populatedRestaurants = await Promise.all(
            restaurants.map(async (restaurant) => {
                const populatedMenus = await Promise.all(
                    restaurant.menu_items.map(async (menuId) => {
                        const menu = await fetchMenuById(menuId); // Fetch each menu by its ID
                        return menu;
                    })
                );

                // Return restaurant with populated menu items
                return {
                    ...restaurant.toObject(),
                    menu_items: populatedMenus,
                };
            })
        );

        res.status(200).json(populatedRestaurants);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching restaurants', error: error.message });
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
            restaurant_id: restaurant._id
        });
        
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
                 if (!menuItem) {
                    return res.status(400).json({ message: `Menu item "${item.menu_name}" not found in restaurant's menu.` });
                }
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
                // Add the OrderItem _id to the order's order_items field
                newOrder.order_items.push(orderItem._id);

                // Save the updated order with the new order_items
                await newOrder.save();

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
async function fetchOrderById(orderId) {
    try {
        const order = await Order.findById(orderId)
            .populate('restaurant_id', 'name address'); // Populate restaurant details
        return order;
    } catch (error) {
        throw new Error(`Error fetching order: ${error.message}`);
    }
}
async function fetchOrderItems(orderId) {
    try {
        const orderItems = await OrderItem.find({ order_id: orderId }) // Fetch order items related to the order
            .populate('menu_id', 'name price'); // Populate menu details
        return orderItems;
    } catch (error) {
        throw new Error(`Error fetching order items: ${error.message}`);
    }
}


// Track an order
const trackOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await fetchOrderById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Fetch order items for the order
        const orderItems = await fetchOrderItems(orderId);
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
            items: orderItems.map(item => ({
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
        const customerId = req.user.userId;
        // Fetch all orders for the customer, populating restaurant details
        const orders = await Order.find({ customer_id: customerId })
            .populate('restaurant_id', 'name address');
        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'No orders found.' });
        }

        // Populate order items and menu details for each order
        const populatedOrders = await Promise.all(
            orders.map(async (order) => {
                const orderItems = await fetchOrderItems(order._id); // Fetch populated order items
                return {
                    ...order.toObject(),
                    order_items: orderItems, // Attach populated order items
                };
            })
        );
        res.status(200).json(populatedOrders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching order history', error: error.message });
    }
};


module.exports = {
    browseRestaurants,
    searchMenus,
    placeOrder,
    trackOrder,
    viewOrderHistory
};
