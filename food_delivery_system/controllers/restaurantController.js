const Restaurant = require('../models/Restaurant');
const Menu = require('../models/Menu');
const Order = require('../models/Order');
const User = require('../models/User');

// Add new restaurant
const addRestaurant = async (req, res) => {
    try {
        const { name, address, hours_of_operation } = req.body;
        const owner_id = req.user.userId;
        const role = req.user.role;
        
        if (role !== 'Restaurant Owner') {
            return res.status(403).json({ message: 'Only Restaurant Owners can add restaurants' });
        }

        const newRestaurant = new Restaurant({
            owner_id: owner_id,
            name,
            address,
            hours_of_operation,
        });

        await newRestaurant.save();

        await User.findByIdAndUpdate(owner_id, {
            'profile.restaurantDetails': {
                restaurantName: name,
                restaurantAddress: address,
                hoursOfOperation: hours_of_operation,
            }
        });

        res.status(201).json({ message: 'Restaurant created successfully', restaurant: newRestaurant });
    } catch (error) {
        console.error('Error creating restaurant:', error);
        res.status(400).json({ message: 'Error creating restaurant', error });
    }
};

// Manage menus: Add, update, or remove menu items
const manageMenus = async (req, res) => {
    try {
        const { name, description, price, availability } = req.body;

        // Validate required fields
        if (!name || !description || price == null || availability == null) {
            return res.status(400).json({ message: 'Name, description, price, and availability are required' });
        }

        // Validate price and availability
        if (typeof price !== 'number' || typeof availability !== 'boolean') {
            return res.status(400).json({ message: 'Price must be a number and availability must be a boolean' });
        }

        // Find restaurant by owner_id
        const restaurant = await Restaurant.findOne({ owner_id: req.user.userId });

        if (!restaurant) {
            return res.status(404).json({ message: 'No restaurant found for this user' });
        }

        // Check if the menu item already exists for the restaurant
        let menuItem = await Menu.findOne({ name, restaurant_id: restaurant._id });
        if (menuItem) {
            // Update the existing menu item
            menuItem.description = description;
            menuItem.price = price;
            menuItem.availability = availability;
        } else {
            // Create a new menu item
            menuItem = new Menu({
                restaurant_id: restaurant._id,
                name,
                description,
                price,
                availability,
            });
        }

        // Save the menu item (add or update)
        await menuItem.save();
        res.status(201).json({ message: 'Menu item created/updated', menuItem });

    } catch (error) {
        console.error('Error managing menu:', error);
        res.status(500).json({ message: 'Error managing menu', error });
    }
};


// Remove item from menu

const removeMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Perform the operation to delete the menu item from the database
        const result = await Menu.findByIdAndDelete(id); // Use Menu, not MenuItem
  
        if (!result) {
            return res.status(404).json({ message: "Menu item not found" });
        }
  
        return res.status(200).json({ message: "Food item deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error deleting menu item", error: error.message });
    }
};

  
 
  

// View restaurant orders and update their status
const viewOrders = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ owner_id: req.user.user_id });
        if (!restaurant) {
            return res.status(400).json({ message: 'Restaurant not found for this user' });
        }

        const orders = await Order.find({ restaurant: restaurant._id })
            .populate('customer')
            .populate('items.menu');

        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Error fetching orders', error });
    }
};

// Update order status (accepted, preparing, ready for delivery)
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        // Validating the provided status against the schema's enum
        if (!['placed', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status provided' });
        }

        const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({ message: 'Order status updated', order });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Error updating order status', error });
    }
};


// Update restaurant details
const updateRestaurantDetails = async (req, res) => {
    try {
        const { name, address, hours_of_operation } = req.body;
        const owner_id = req.user.userId;  // Assuming user_id is the owner ID in this case

        // Find the restaurant by the owner's user ID
        const restaurant = await Restaurant.findOne({ owner_id });

        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found for this user' });
        }

        // Update the restaurant details
        restaurant.name = name || restaurant.name;
        restaurant.address = address || restaurant.address;
        restaurant.hours_of_operation = hours_of_operation || restaurant.hours_of_operation;

        await restaurant.save();  // Save the updated restaurant details

        res.status(200).json({ message: 'Restaurant details updated', restaurant });
    } catch (error) {
        console.error('Error updating restaurant details:', error);
        res.status(400).json({ message: 'Error updating restaurant details', error });
    }
};


module.exports = {
    addRestaurant,
    manageMenus,
    removeMenuItem,
    viewOrders,
    updateOrderStatus,
    updateRestaurantDetails
};
