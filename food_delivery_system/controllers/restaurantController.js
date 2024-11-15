const Restaurant = require('../models/Restaurant');
const Menu = require('../models/Menu');
const Order = require('../models/Order');

// Add new restaurant
const addRestaurant = async (req, res) => {
    try {
        const { name, address, hours_of_operation } = req.body;
        const owner_id = req.user.user_id; // Extract owner ID from JWT token

        const newRestaurant = new Restaurant({
            owner_id,
            name,
            address,
            hours_of_operation
        });

        await newRestaurant.save();
        res.status(201).json({ message: 'Restaurant created successfully', restaurant: newRestaurant });
    } catch (error) {
        res.status(400).json({ message: 'Error creating restaurant', error });
    }
};

// Manage menus: Add or update menu items
const manageMenus = async (req, res) => {
    try {
        const { name, description, price, availability } = req.body;
        
        // Ensure restaurant_id is available
        let restaurant_id = req.user.restaurant_id;

        // If restaurant_id is undefined, fetch it from the Restaurant model
        if (!restaurant_id) {
            const restaurant = await Restaurant.findOne({ owner_id: req.user.user_id });
            if (!restaurant) {
                return res.status(400).json({ message: 'Restaurant not found for this user' });
            }
            restaurant_id = restaurant._id;
        }

        console.log("Restaurant ID:", restaurant_id);  // Log the restaurant ID for confirmation

        let menuItem = await Menu.findOne({ name, restaurant_id });
        if (menuItem) {
            menuItem.description = description;
            menuItem.price = price;
            menuItem.availability = availability;
        } else {
            menuItem = new Menu({
                restaurant_id,
                name,
                description,
                price,
                availability
            });
        }

        await menuItem.save();
        res.status(201).json({ message: 'Menu item created/updated', menuItem });
    } catch (error) {
        console.error('Error managing menu:', error);
        res.status(400).json({ message: 'Error managing menu', error });
    }
};

// View restaurant orders
const viewOrders = async (req, res) => {
    try {
        const restaurant_id = req.user.user_id; // Assuming the restaurant's owner ID is linked with user_id
        const orders = await Order.find({ restaurant: restaurant_id })
            .populate('customer')
            .populate('items.menu');

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error });
    }
};

// Update restaurant details
const updateRestaurantDetails = async (req, res) => {
    try {
        const { name, address, hours_of_operation } = req.body;
        const restaurant_id = req.user.user_id;

        const restaurant = await Restaurant.findByIdAndUpdate(
            restaurant_id,
            { name, address, hours_of_operation },
            { new: true, runValidators: true }
        );

        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        res.status(200).json({ message: 'Restaurant details updated', restaurant });
    } catch (error) {
        res.status(400).json({ message: 'Error updating restaurant details', error });
    }
};

// Remove item from menu
const deleteFoodMenu = async (req, res) => {
    try {
        const foodId = req.params.id;
        console.log(foodId);
        if (!foodId) {
            return res.status(404).send({
                success: false,
                message: "Provide food ID",
            });
        }
        const food = await Menu.findById(foodId);
        if (!food) {
            return res.status(404).send({
                success: false,
                message: "No food found with the provided ID",
            });
        }
        await Menu.findByIdAndDelete(foodId);
        res.status(200).send({
            success: true,
            message: "Food item deleted successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in deleting food item",
            error,
        });
    }
};

module.exports = {
    addRestaurant,
    manageMenus,
    viewOrders,
    updateRestaurantDetails,
    deleteFoodMenu
};
