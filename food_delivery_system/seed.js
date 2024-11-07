const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// Models
const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const Delivery = require('./models/Delivery');
const Menu = require('./models/Menu');            
const OrderItem = require('./models/OrderItem');  
const Order = require('./models/Order'); 

// Connect to MongoDB
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => console.error('MongoDB connection error:', err));

async function seedDatabase() {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await Delivery.deleteMany({});
    await Menu.deleteMany({});
    await OrderItem.deleteMany({});
    await Order.deleteMany({});
    
    console.log('Existing data cleared.');

    // Seed users (admin, restaurant owner, delivery personnel, customer)
    const admin = await User.create({
      email: 'admin@example.com',
      password: 'securePassword123',
      role: 'Administrator',
      profile: {
        name: 'Admin User',
        contactDetails: 'admin@example.com',
        address: 'N/A',
      },
    });

    const restaurantOwner = await User.create({
      email: 'owner@example.com',
      password: 'securePassword123',
      role: 'Restaurant Owner',
      profile: {
        name: 'Owner User',
        contactDetails: 'owner@example.com',
        address: 'N/A',
      },
    });

    const deliveryPersonnel = await User.create({
      email: 'delivery@example.com',
      password: 'securePassword123',
      role: 'Delivery Personnel',
      profile: {
        name: 'Delivery User',
        contactDetails: 'delivery@example.com',
        address: 'N/A',
        vehicleType: 'Bike',
      },
    });

    const customer = await User.create({
      email: 'customer@example.com',
      password: 'securePassword123',
      role: 'Customer',
      profile: {
        name: 'Khyati Soral',
        contactDetails: '99876451',
        address: 'ABC Lane 24, west, India',
      },
    });

    // Seed a restaurant
    const restaurant = await Restaurant.create({
      owner_id: restaurantOwner._id,
      name: 'Good Eats',
      address: '456 Foodie Lane, City',
      hours_of_operation: '10:00 AM - 10:00 PM',
    });

    // Seed menu items for the restaurant
    const menuItems = await Menu.insertMany([
      {
        restaurant_id: restaurant._id,
        name: 'Pasta Primavera',
        description: 'Fresh vegetables with pasta.',
        price: 12.99,
        availability: true,
      },
      {
        restaurant_id: restaurant._id,
        name: 'Caesar Salad',
        description: 'Classic Caesar salad with croutons.',
        price: 8.99,
        availability: true,
      },
    ]);

    // Place an order
    const order = new Order({
      customer_id: customer._id,
      restaurant_id: restaurant._id,
      items: [], // Start with an empty array; we'll populate this with OrderItems
      status: 'placed',
    });
    await order.save();

    // Seed order items based on menu items
    const orderItems = await OrderItem.insertMany([
      {
        order_id: order._id,
        customer_id: customer._id,
        restaurant_id: restaurant._id,
        menu_id: menuItems[0]._id,
        quantity: 2,
        price: menuItems[0].price * 2,
        status: 'ordered',
      },
      {
        order_id: order._id,
        customer_id: customer._id,
        restaurant_id: restaurant._id,
        menu_id: menuItems[1]._id,
        quantity: 1,
        price: menuItems[1].price,
        status: 'ordered',
      },
    ]);

    // Update order with items
    order.items = orderItems.map(item => item._id);
    await order.save();

    // Seed a delivery record
    const delivery = await Delivery.create({
      order_id: order._id,
      delivery_personnel_id: deliveryPersonnel._id,
      status: 'picked up',
      deliveryTime: 30, // Assuming it took 30 minutes for this delivery
    });

    console.log('Seeding completed successfully.');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedDatabase();
