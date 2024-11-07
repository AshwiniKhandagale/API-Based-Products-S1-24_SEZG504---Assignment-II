// models/CustomerModel.js
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  deliveryAddress: { type: String },
  paymentDetails: { type: String },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Customer', customerSchema);
