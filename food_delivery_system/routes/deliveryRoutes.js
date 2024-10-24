const express = require('express');
const { viewAvailableDeliveries, trackDeliveryStatus, manageDeliveryAvailability } = require('../controllers/deliveryController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Deliveries
 *   description: Delivery personnel endpoints
 */

/**
 * @swagger
 * /api/deliveries/available-deliveries:
 *   get:
 *     summary: View available deliveries
 *     tags: [Deliveries]
 *     responses:
 *       200:
 *         description: List of available deliveries
 */
router.get('/available-deliveries', viewAvailableDeliveries);

/**
 * @swagger
 * /api/deliveries/{deliveryId}:
 *   put:
 *     summary: Update delivery status
 *     tags: [Deliveries]
 *     parameters:
 *       - in: path
 *         name: deliveryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Delivery ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [picked up, en route, delivered]
 *     responses:
 *       200:
 *         description: Delivery status updated
 *       400:
 *         description: Bad request
 *       404:
 *         description: Delivery not found
 */
router.put('/deliveries/:deliveryId', trackDeliveryStatus);

/**
 * @swagger
 * /api/deliveries/availability:
 *   put:
 *     summary: Manage delivery availability
 *     tags: [Deliveries]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - available
 *             properties:
 *               available:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Delivery availability updated
 *       400:
 *         description: Bad request
 */
router.put('/availability', manageDeliveryAvailability);

module.exports = router;
