const express = require('express');
const {
    addRestaurant,
    manageMenus,
    viewOrders,
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
 *       - bearerAuth: []
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
 *     summary: Manage restaurant menus
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - availability
 *             properties:
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
 *         description: Menu item created/updated
 *       400:
 *         description: Bad request
 */
router.post('/menus', authMiddleware('Restaurant Owner'), manageMenus);

/**
 * @swagger
 * /api/restaurants/orders:
 *   get:
 *     summary: View restaurant orders
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 *       500:
 *         description: Error fetching orders
 */
router.get('/orders', authMiddleware('Restaurant Owner'), viewOrders);

/**
 * @swagger
 * /api/restaurants/details:
 *   put:
 *     summary: Update restaurant details
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
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
 *         description: Restaurant details updated
 *       400:
 *         description: Bad request
 */
router.put('/details', authMiddleware('Restaurant Owner'), updateRestaurantDetails);

//to delete item from food menu
router.delete('/deletemenu/:id', authMiddleware('Restaurant Owner'), deleteFoodMenu);

module.exports = router;
