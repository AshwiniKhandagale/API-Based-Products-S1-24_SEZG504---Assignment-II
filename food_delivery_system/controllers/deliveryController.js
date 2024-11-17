const Delivery = require('../models/Delivery');

// Helper function to validate status transitions
const isValidStatusTransition = (currentStatus, newStatus) => {
    const validTransitions = {
        'pending': ['picked up'],
        'picked up': ['en route'],
        'en route': ['delivered'],
    };
    return validTransitions[currentStatus]?.includes(newStatus);
};

// View available deliveries
const viewAvailableDeliveries = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query; // Pagination
        const availableDeliveries = await Delivery.find({ status: 'pending' })
            .populate('order_id', 'customer_id restaurant_id')
            .skip((page - 1) * limit)
            .limit(Number(limit));

        res.status(200).json({
            success: true,
            data: availableDeliveries,
            pagination: { page: Number(page), limit: Number(limit) },
        });
    } catch (error) {
        console.error('Error fetching available deliveries:', error);
        res.status(500).json({ message: 'Error fetching available deliveries', error });
    }
};

// Accept a delivery
const acceptDelivery = async (req, res) => {
    const { deliveryId } = req.params;
    const deliveryPersonnelId = req.user.id;

    try {
        const delivery = await Delivery.findOneAndUpdate(
            { _id: deliveryId, status: 'pending' },
            { delivery_personnel_id: deliveryPersonnelId, status: 'picked up' },
            { new: true }
        );

        if (!delivery) {
            return res.status(404).json({ message: 'Delivery not found or already accepted' });
        }

        res.status(200).json({ message: 'Delivery accepted', delivery });
    } catch (error) {
        console.error('Error accepting delivery:', error);
        res.status(500).json({ message: 'Error accepting delivery', error });
    }
};

// Track delivery status
const trackDeliveryStatus = async (req, res) => {
    const { deliveryId } = req.params;
    const { status } = req.body;

    try {
        const delivery = await Delivery.findById(deliveryId);

        if (!delivery) {
            return res.status(404).json({ message: 'Delivery not found' });
        }

        if (!isValidStatusTransition(delivery.status, status)) {
            return res.status(400).json({
                message: `Invalid status transition from ${delivery.status} to ${status}`,
            });
        }

        delivery.status = status;
        await delivery.save();

        res.status(200).json({ message: 'Delivery status updated', delivery });
    } catch (error) {
        console.error('Error updating delivery status:', error);
        res.status(500).json({ message: 'Error updating delivery status', error });
    }
};

// Manage delivery availability
const manageDeliveryAvailability = async (req, res) => {
    const { available } = req.body;
    const deliveryPersonnelId = req.user.id;

    try {
        const deliveryPersonnel = await Delivery.findOneAndUpdate(
            { delivery_personnel_id: deliveryPersonnelId },
            { available },
            { new: true, runValidators: true }
        );

        if (!deliveryPersonnel) {
            return res.status(404).json({ message: 'Delivery personnel not found' });
        }

        res.status(200).json({ message: 'Delivery availability updated', deliveryPersonnel });
    } catch (error) {
        console.error('Error updating delivery availability:', error);
        res.status(500).json({ message: 'Error updating delivery availability', error });
    }
};

module.exports = {
    viewAvailableDeliveries,
    acceptDelivery,
    trackDeliveryStatus,
    manageDeliveryAvailability,
};
