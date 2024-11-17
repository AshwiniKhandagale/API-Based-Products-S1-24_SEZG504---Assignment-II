const express = require('express');
const { 
    browseRestaurants, 
    searchMenus, 
    placeOrder, 
    trackOrder, 
    viewOrderHistory 
} = require('../controllers/customerController');
const authMiddleware = require('../middlewares/authMiddleware'); // Assuming this middleware checks JWT
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Customer endpoints
 */

/**
 * @swagger
 * /api/customers/restaurants:
 *   get:
 *     summary: Browse restaurants
 *     tags: [Customers]
 *     security:
 *       - BearerAuth: []  # This enables token-based authentication for this route
 *     responses:
 *       200:
 *         description: List of restaurants
 */
router.get('/restaurants', authMiddleware("Customer"), browseRestaurants);

/**
 * @swagger
 * /api/customers/menus:
 *   get:
 *     summary: Search menus
 *     tags: [Customers]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *     security:
 *       - BearerAuth: []  # This enables token-based authentication for this route
 *     responses:
 *       200:
 *         description: List of menu items
 */
router.get('/menus', authMiddleware("Customer"), searchMenus);

/**
 * @swagger
 * /api/customers/orders:
 *   post:
 *     summary: Place an order
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurant_name
 *               - items
 *             properties:
 *               restaurant_name:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - menu_name
 *                     - quantity
 *                   properties:
 *                     menu_name:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *     security:
 *       - BearerAuth: []  # This enables token-based authentication for this route
 *     responses:
 *       201:
 *         description: Order placed successfully
 *       400:
 *         description: Bad request
 */
router.post('/orders', authMiddleware("Customer"), placeOrder);

/**
 * @swagger
 * /api/customers/orders/{orderId}:
 *   get:
 *     summary: Track an order
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     security:
 *       - BearerAuth: []  # This enables token-based authentication for this route
 *     responses:
 *       200:
 *         description: Order status
 *       404:
 *         description: Order not found
 */
router.get('/orders/:orderId', authMiddleware("Customer"), trackOrder);

/**
 * @swagger
 * /api/customers/order-history:
 *   get:
 *     summary: View order history
 *     tags: [Customers]
 *     security:
 *       - BearerAuth: []  # This enables token-based authentication for this route
 *     responses:
 *       200:
 *         description: List of past orders
 */
router.get('/order-history', authMiddleware("Customer"), viewOrderHistory);

module.exports = router;
