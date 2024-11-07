const Delivery = require('../models/Delivery');
const Order = require('../models/Order');

// View available deliveries
const viewAvailableDeliveries = async (req, res) => {
    try {
        // Find all deliveries that are still pending
        const availableDeliveries = await Delivery.find({ status: 'pending' }).populate('order_id', 'customer_id restaurant_id');

        res.status(200).json(availableDeliveries);
    } catch (error) {
        console.error('Error fetching available deliveries:', error);
        res.status(500).json({ message: 'Error fetching available deliveries', error });
    }
};

// Accept delivery
const acceptDelivery = async (req, res) => {
    const { deliveryId } = req.params;  // Delivery ID passed in the URL
    const deliveryPersonnelId = req.user.id;  // Assuming the delivery personnel ID comes from the authenticated user (from JWT)

    console.log("deliveryId : ", deliveryId);
    console.log("DP ID : ", deliveryPersonnelId);

    try {
        const delivery = await Delivery.findById(deliveryId);

        if (!delivery) {
            return res.status(404).json({ message: 'Delivery not found' });
        }

        // Check if the delivery has already been accepted or completed
        if (delivery.status !== 'pending') {
            return res.status(400).json({ message: 'This delivery cannot be accepted, it is already in progress or completed' });
        }

        // Assign the delivery to the delivery personnel and update the status to "accepted"
        delivery.delivery_personnel_id = deliveryPersonnelId;
        delivery.status = 'accepted';  // Update the status to accepted
        await delivery.save();

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

        // Update delivery status
        if (['pending','picked up', 'en route', 'delivered'].includes(status)) {
            delivery.status = status;
            await delivery.save();
            res.status(200).json({ message: 'Delivery status updated', delivery });
        } else {
            res.status(400).json({ message: 'Invalid status value' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Error updating delivery status', error });
    }
};

// Manage delivery availability
const manageDeliveryAvailability = async (req, res) => {
    const { available } = req.body;
    const deliveryPersonnelId = req.user.id; // Assuming auth middleware adds user ID to req.user

    try {
        const deliveryPersonnel = await Delivery.findOneAndUpdate(
            { personnelId: deliveryPersonnelId },
            { available },
            { new: true, runValidators: true }
        );

        if (!deliveryPersonnel) {
            return res.status(404).json({ message: 'Delivery personnel not found' });
        }

        res.status(200).json({ message: 'Delivery availability updated', deliveryPersonnel });
    } catch (error) {
        res.status(400).json({ message: 'Error updating delivery availability', error });
    }
};

module.exports = {
    viewAvailableDeliveries,
    acceptDelivery,
    trackDeliveryStatus,
    manageDeliveryAvailability
};
