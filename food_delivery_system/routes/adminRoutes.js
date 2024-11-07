const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middlewares/authMiddleware');  // Ensure JWT and role-based access

// Manage Users (Create, Update, Deactivate)
router.post('/users', auth('Administrator'), adminController.createUser);
//router.post('/users', adminController.createUser);
router.put('/users/:id', auth('Administrator'), adminController.updateUser);
router.delete('/users/:id', auth('Administrator'), adminController.deactivateUser);

// View and Manage Orders
router.get('/orders', auth('Administrator'), adminController.viewOrders);
router.put('/orders/:id', auth('Administrator'), adminController.manageOrder);

// Generate Reports
router.get('/reports/popular-restaurants', auth('Administrator'), adminController.generatePopularRestaurantsReport);

// Monitor Platform Activity
router.get('/activity', auth('Administrator'), adminController.monitorActivity);

module.exports = router;
