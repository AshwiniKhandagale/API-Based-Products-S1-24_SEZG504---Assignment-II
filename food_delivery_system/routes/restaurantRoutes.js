const express = require('express');
const { manageMenus, viewOrders, updateRestaurantDetails } = require('../controllers/restaurantController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Restaurants
 *   description: Restaurant owner endpoints
 */

/**
 * @swagger
 * /api/restaurants/menus:
 *   post:
 *     summary: Manage restaurant menus
 *     tags: [Restaurants]
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
router.post('/menus', manageMenus);

/**
 * @swagger
 * /api/restaurants/orders:
 *   get:
 *     summary: View restaurant orders
 *     tags: [Restaurants]
 *     responses:
 *       200:
 *         description: List of orders
 */
router.get('/orders', viewOrders);

/**
 * @swagger
 * /api/restaurants/details:
 *   put:
 *     summary: Update restaurant details
 *     tags: [Restaurants]
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
router.put('/details', updateRestaurantDetails);

module.exports = router;
