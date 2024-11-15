const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('../models/User'); 
// Define the schema for Restaurant
const restaurantSchema = new Schema({
    owner_id: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
      required: true
    },
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    hours_of_operation: {
        type: String,
        required: true
    },
    menu_items: [
        {
            type: Schema.Types.ObjectId,
            ref: 'MenuItem' // Reference to the MenuItem model
        }
    ]
}, { timestamps: true });

// Create a model based on the schema
const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
