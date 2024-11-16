const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    delivery_personnel_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    status: { type: String, enum: ['pending','picked up', 'en route', 'delivered', 'rescheduled', 'cancelled'], default: 'picked up' },
    deliveryTime: { type: Number},
    rescheduledTime: { type: Date }, // Optional rescheduled time
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Delivery', deliverySchema);
