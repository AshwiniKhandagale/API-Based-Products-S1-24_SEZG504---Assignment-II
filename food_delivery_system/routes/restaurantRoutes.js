const express = require('express');
const {
    addRestaurant,
    manageMenus,
    removeMenuItem,
    viewOrders,
    updateOrderStatus,
    updateRestaurantDetails
} = require('../controllers/restaurantController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Restaurants
 *   description: Restaurant owner endpoints
 */

/**
 * @swagger
 * /api/restaurants:
 *   post:
 *     summary: Add a new restaurant
 *     tags: [Restaurants]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *               - hours_of_operation
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               hours_of_operation:
 *                 type: string
 *     responses:
 *       201:
 *         description: Restaurant created successfully
 *       400:
 *         description: Bad request
 */
router.post('/', authMiddleware('Restaurant Owner'), addRestaurant);

/**
 * @swagger
 * /api/restaurants/menus:
 *   post:
 *     summary: Manage restaurant menus (Add or Update menu items)
 *     tags: [Restaurants]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurant_id
 *               - name
 *               - description
 *               - price
 *               - availability
 *             properties:
 *               restaurant_id:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               availability:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Menu item created/updated successfully
 *       400:
 *         description: Bad request
 */
router.post('/menus', authMiddleware('Restaurant Owner'), manageMenus);

/**
 * @swagger
 * /api/restaurants/menus/{id}:
 *   delete:
 *     summary: Remove a menu item
 *     tags: [Restaurants]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the food item to delete
 *     responses:
 *       200:
 *         description: Food item deleted successfully
 *       404:
 *         description: Food item not found
 */
router.delete('/menus/:id', authMiddleware('Restaurant Owner'), removeMenuItem);

/**
 * @swagger
 * /api/restaurants/orders:
 *   get:
 *     summary: View restaurant orders and update their status (e.g., accepted, preparing, ready for delivery)
 *     tags: [Restaurants]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders with status
 *       500:
 *         description: Error fetching orders
 */
router.get('/orders', authMiddleware('Restaurant Owner'), viewOrders);

/**
 * @swagger
 * /api/restaurants/orders/status:
 *   put:
 *     summary: Update the status of an order (e.g., accepted, preparing, ready for delivery)
 *     tags: [Restaurants]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order_id
 *               - status
 *             properties:
 *               order_id:
 *                 type: string
 *                 description: The ID of the order to update
 *               status:
 *                 type: string
 *                 description: The new status for the order (accepted, preparing, ready for delivery)
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Invalid order status or bad request
 *       404:
 *         description: Order not found
 *       500:
 *         description: Error updating order status
 */
router.put('/orders/status', authMiddleware('Restaurant Owner'), updateOrderStatus);

/**
 * @swagger
 * /api/restaurants/details:
 *   put:
 *     summary: Update restaurant details (e.g., opening hours, delivery zones)
 *     tags: [Restaurants]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *               - hours_of_operation
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               hours_of_operation:
 *                 type: string
 *     responses:
 *       200:
 *         description: Restaurant details updated successfully
 *       400:
 *         description: Bad request
 */
router.put('/details', authMiddleware('Restaurant Owner'), updateRestaurantDetails);

module.exports = router;
