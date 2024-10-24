const express = require('express');
const { manageUsers, viewAndManageOrders, generateReports, monitorPlatformActivity } = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

router.post('/users', manageUsers);
router.get('/orders', viewAndManageOrders);
router.get('/reports', generateReports);
router.get('/activity', monitorPlatformActivity);

module.exports = router;
