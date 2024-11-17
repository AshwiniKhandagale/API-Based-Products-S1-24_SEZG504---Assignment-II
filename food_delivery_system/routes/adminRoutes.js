const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middlewares/authMiddleware');  // Ensure JWT and role-based access

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrator endpoints
 */

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Create a new user (Administrator only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
*           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: ['Customer', 'Restaurant Owner', 'Delivery Personnel', 'Administrator']
 *               profile:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   contactDetails:
 *                     type: string
 *                   address:
 *                     type: string
 *                   vehicleType:
 *                     type: string
 *                   deliveryAddress:
 *                     type: object
 *                     properties:
 *                       street:
 *                         type: string
 *                       city:
 *                         type: string
 *                       postalCode:
 *                         type: string
 *                       country:
 *                         type: string
 *                   paymentDetails:
 *                     type: object
 *                     properties:
 *                       cardNumber:
 *                         type: string
 *                       expirationDate:
 *                         type: string
 *                       cvv:
 *                         type: string
 *                   restaurantDetails:
 *                     type: object
 *                     properties:
 *                       restaurantName:
 *                         type: string
 *                       restaurantAddress:
 *                         type: string
 *                       hoursOfOperation:
 *                         type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/users', auth('Administrator'), adminController.createUser);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     summary: Update a user's details (Administrator only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [Administrator, Restaurant Owner, Customer]
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put('/users/:id', auth('Administrator'), adminController.updateUser);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Deactivate a user (Administrator only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to deactivate
 *     responses:
 *       200:
 *         description: User deactivated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete('/users/:id', auth('Administrator'), adminController.deactivateUser);

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: View all orders (Administrator only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/orders', auth('Administrator'), adminController.viewOrders);

/**
 * @swagger
 * /api/admin/orders/{id}:
 *   put:
 *     summary: Manage the order status (Administrator only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the order to manage
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
 *                 enum: [placed, preparing, ready, out-for-delivery, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Order status updated
 *       400:
 *         description: Invalid status provided
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put('/orders/:id', auth('Administrator'), adminController.manageOrder);

/**
 * @swagger
 * /api/admin/reports/popular-restaurants:
 *   get:
 *     summary: Generate a report of popular restaurants (Administrator only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Popular restaurants report generated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/reports/popular-restaurants', auth('Administrator'), adminController.generatePopularRestaurantsReport);

/**
 * @swagger
 * /api/admin/activity:
 *   get:
 *     summary: Monitor platform activity (Administrator only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Platform activity data retrieved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/activity', auth('Administrator'), adminController.monitorActivity);

module.exports = router;
