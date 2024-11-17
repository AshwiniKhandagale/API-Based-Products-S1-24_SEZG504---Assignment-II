const express = require('express');
const { register, login } = require('../controllers/authController');
const { body } = require('express-validator'); // Validation middleware
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
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
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */
router.post('/register', [
    // Validate required fields
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['Customer', 'Restaurant Owner', 'Delivery Personnel', 'Administrator']).withMessage('Invalid role'),

    // Conditionally validate profile based on role
    body('profile.name').optional().isString().withMessage('Name must be a string'),
    body('profile.contactDetails').optional().isString().withMessage('Contact details must be a string'),
    body('profile.address').optional().isString().withMessage('Address must be a string'),
    body('profile.vehicleType').optional().isString().withMessage('Vehicle type must be a string')
        .custom((value, { req }) => {
            if (req.body.role === 'Delivery Personnel' && !value) {
                throw new Error('Vehicle type is required for Delivery Personnel');
            }
            return true;
        }),
    body('profile.deliveryAddress').optional().isObject().withMessage('Delivery address must be an object')
        .custom((value, { req }) => {
            if (req.body.role === 'Customer' && !value) {
                throw new Error('Delivery address is required for Customers');
            }
            return true;
        }),
    body('profile.paymentDetails').optional().isObject().withMessage('Payment details must be an object')
        .custom((value, { req }) => {
            if (req.body.role === 'Customer' && !value) {
                throw new Error('Payment details are required for Customers');
            }
            return true;
        }),
    body('profile.restaurantDetails').optional().isObject().withMessage('Restaurant details must be an object')
        .custom((value, { req }) => {
            if (req.body.role === 'Restaurant Owner' && !value) {
                throw new Error('Restaurant details are required for Restaurant Owners');
            }
            return true;
        }),
], register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Bad request
 */
router.post('/login', [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], login);

module.exports = router;
