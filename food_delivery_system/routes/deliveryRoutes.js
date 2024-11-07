const express = require('express');
const { viewAvailableDeliveries,acceptDelivery, trackDeliveryStatus, manageDeliveryAvailability } = require('../controllers/deliveryController');
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
router.get('/available-deliveries',authMiddleware("Delivery Personnel"), viewAvailableDeliveries);

/**
 * @swagger
 * /api/deliveries/{deliveryId}/accept:
 *   put:
 *     summary: Accept a delivery
 *     tags: [Deliveries]
 *     parameters:
 *       - in: path
 *         name: deliveryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Delivery ID to be accepted
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deliveryPersonnelId:
 *                 type: string
 *                 description: ID of the delivery personnel accepting the delivery
 *     responses:
 *       200:
 *         description: Delivery accepted
 *       404:
 *         description: Delivery not found
 *       400:
 *         description: Invalid delivery status
 */
router.put('/deliveries/:deliveryId/accept',authMiddleware("Delivery Personnel"), acceptDelivery);

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
router.put('/deliveries/:deliveryId',authMiddleware("Delivery Personnel"), trackDeliveryStatus);

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
router.put('/availability',authMiddleware("Delivery Personnel"), manageDeliveryAvailability);

module.exports = router;
