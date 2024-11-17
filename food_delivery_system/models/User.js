const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        enum: ['Customer', 'Restaurant Owner', 'Delivery Personnel', 'Administrator'], 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
    profile: {
        // Common fields for all users
        name: { 
            type: String, 
            required: false 
        },
        contactDetails: { 
            type: String, 
            required: false 
        },
        address: { 
            type: String, 
            required: false 
        },
        
        // Fields specific to Delivery Personnel
        vehicleType: { 
            type: String, // Relevant only for delivery personnel
            required: function() { return this.role === 'Delivery Personnel'; }
        },

        // Fields specific to Customer
        deliveryAddress: {
            street: { type: String },
            city: { type: String },
            postalCode: { type: String },
            country: { type: String }
        },
        paymentDetails: {
            cardNumber: { type: String },
            expirationDate: { type: String },
            cvv: { type: String }
        },

        // Fields specific to Restaurant Owner
        restaurantDetails: {
            restaurantName: { 
                type: String, 
                required: function() { return this.role === 'Restaurant Owner'; } 
            },
            restaurantAddress: { 
                type: String, 
                required: function() { return this.role === 'Restaurant Owner'; } 
            },
            hoursOfOperation: { 
                type: String, 
                required: function() { return this.role === 'Restaurant Owner'; } 
            }
        }
    }
});

// Middleware to handle the updating of timestamps
userSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('User', userSchema);
