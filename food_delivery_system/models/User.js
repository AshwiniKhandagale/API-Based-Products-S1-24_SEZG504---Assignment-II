const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['Customer', 'Restaurant Owner', 'Delivery Personnel', 'Administrator'], 
        required: true 
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    profile: {
        name: { type: String, required: false },
        contactDetails: { type: String, required: false },
        address: { type: String, required: false },
        deliveryAddress: {
            street: { type: String },
            city: { type: String },
            postalCode: { type: String },
            country: { type: String }
        },
        vehicleType: { type: String }, // Relevant for delivery personnel
        paymentDetails: {
            cardNumber: { type: String },
            expirationDate: { type: String },
            cvv: { type: String },
        }
    }
});

module.exports = mongoose.model('User', userSchema);
