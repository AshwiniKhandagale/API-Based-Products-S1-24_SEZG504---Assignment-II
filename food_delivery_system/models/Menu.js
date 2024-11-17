const mongoose = require('mongoose');

// Define the menu schema
const menuSchema = new mongoose.Schema(
  {
    restaurant_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Restaurant', 
      required: true 
    },
    name: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String, 
      required: true 
    },
    price: { 
      type: mongoose.Schema.Types.Decimal128, // Improved type for currency accuracy
      required: true 
    },
    availability: { 
      type: Boolean, 
      default: true 
    },
  },
  {
    timestamps: true, // Automatically handles createdAt and updatedAt
  }
);

// Create an index for faster querying by restaurant_id
menuSchema.index({ restaurant_id: 1 });

// Export the model
module.exports = mongoose.model('Menu', menuSchema);
