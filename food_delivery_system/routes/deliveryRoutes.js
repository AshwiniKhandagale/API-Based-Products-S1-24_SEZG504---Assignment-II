const express = require('express');
const {
    viewAvailableDeliveries,
    acceptDelivery,
    trackDeliveryStatus,
    manageDeliveryAvailability,
} = require('../controllers/deliveryController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

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
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of available deliveries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The unique ID of the delivery
 *                       order_id:
 *                         type: string
 *                         description: The ID of the associated order
 *                       delivery_personnel_id:
 *                         type: string
 *                         description: The ID of the delivery personnel
 *                       status:
 *                         type: string
 *                         enum: [pending, picked up, en route, delivered, rescheduled, cancelled]
 *                         description: The status of the delivery
 *                       deliveryTime:
 *                         type: integer
 *                         description: The time the delivery is expected to take
 *                       rescheduledTime:
 *                         type: string
 *                         format: date-time
 *                         description: The time the delivery was rescheduled, if applicable
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: The timestamp when the delivery was created
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         description: The timestamp when the delivery was last updated
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 */
router.get('/available-deliveries', authMiddleware("Delivery Personnel"), viewAvailableDeliveries);

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
 *         description: Delivery ID to accept
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Delivery accepted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 delivery:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: The unique ID of the delivery
 *                     order_id:
 *                       type: string
 *                       description: The ID of the associated order
 *                     delivery_personnel_id:
 *                       type: string
 *                       description: The ID of the delivery personnel
 *                     status:
 *                       type: string
 *                       enum: [pending, picked up, en route, delivered, rescheduled, cancelled]
 *                       description: The status of the delivery
 *                     deliveryTime:
 *                       type: integer
 *                       description: The time the delivery is expected to take
 *                     rescheduledTime:
 *                       type: string
 *                       format: date-time
 *                       description: The time the delivery was rescheduled, if applicable
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: The timestamp when the delivery was created
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: The timestamp when the delivery was last updated
 */
router.put('/:deliveryId/accept', authMiddleware("Delivery Personnel"), acceptDelivery);

/**
 * @swagger
 * /api/deliveries/{deliveryId}/status:
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
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Delivery status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 delivery:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: The unique ID of the delivery
 *                     order_id:
 *                       type: string
 *                       description: The ID of the associated order
 *                     delivery_personnel_id:
 *                       type: string
 *                       description: The ID of the delivery personnel
 *                     status:
 *                       type: string
 *                       enum: [pending, picked up, en route, delivered, rescheduled, cancelled]
 *                       description: The status of the delivery
 *                     deliveryTime:
 *                       type: integer
 *                       description: The time the delivery is expected to take
 *                     rescheduledTime:
 *                       type: string
 *                       format: date-time
 *                       description: The time the delivery was rescheduled, if applicable
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: The timestamp when the delivery was created
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: The timestamp when the delivery was last updated
 *       400:
 *         description: Invalid status transition
 *       404:
 *         description: Delivery not found
 */
router.put('/:deliveryId/status', authMiddleware("Delivery Personnel"), trackDeliveryStatus);

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
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Delivery availability updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 deliveryPersonnel:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: The unique ID of the delivery personnel
 *                     available:
 *                       type: boolean
 *                       description: The availability status of the delivery personnel
 *                     name:
 *                       type: string
 *                       description: The name of the delivery personnel
 */
router.put('/availability', authMiddleware("Delivery Personnel"), manageDeliveryAvailability);

module.exports = router;
