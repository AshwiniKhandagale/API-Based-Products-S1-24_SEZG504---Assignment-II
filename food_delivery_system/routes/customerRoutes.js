const express = require('express');
const { browseRestaurants, searchMenus, placeOrder, trackOrder, viewOrderHistory } = require('../controllers/customerController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

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
 *     responses:
 *       200:
 *         description: List of restaurants
 */
router.get('/restaurants', browseRestaurants);

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
 *     responses:
 *       200:
 *         description: List of menu items
 */
router.get('/menus', searchMenus);

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
 *               - restaurant_id
 *               - items
 *             properties:
 *               restaurant_id:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - menu_id
 *                     - quantity
 *                   properties:
 *                     menu_id:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Order placed successfully
 *       400:
 *         description: Bad request
 */
router.post('/orders', placeOrder);

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
 *     responses:
 *       200:
 *         description: Order status
 *       404:
 *         description: Order not found
 */
router.get('/orders/:orderId', trackOrder);

/**
 * @swagger
 * /api/customers/order-history:
 *   get:
 *     summary: View order history
 *     tags: [Customers]
 *     responses:
 *       200:
 *         description: List of past orders
 */
router.get('/order-history', viewOrderHistory);

module.exports = router;
