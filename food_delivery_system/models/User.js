const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    //name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Customer', 'Restaurant Owner', 'Delivery Personnel', 'Administrator'], required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  profile: {
    name: String,
    contactDetails: String,
    address: String,
    vehicleType: String, // Relevant for delivery personnel
  }
});

module.exports = mongoose.model('User', userSchema);
