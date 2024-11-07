// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    restaurant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OrderItem' }],
    status: { type: String, enum: ['placed', 'cancelled', 'rescheduled'], default: 'placed' },
    scheduledTime: { type: Date }, // Optional scheduled time for rescheduling
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
