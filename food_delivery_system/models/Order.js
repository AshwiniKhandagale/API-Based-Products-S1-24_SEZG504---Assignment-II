const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    restaurant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    status: { type: String, enum: ['placed', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'cancelled'], default: 'placed' },
    scheduledTime: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    order_items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OrderItem' }] // Reference to OrderItem
});

module.exports = mongoose.model('Order', orderSchema);
