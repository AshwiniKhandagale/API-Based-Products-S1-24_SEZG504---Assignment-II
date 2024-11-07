const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    name: { type: String, required: true },
    address: { type: String, required: true },
    hours_of_operation: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
