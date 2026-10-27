const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/statsController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/dashboard', authenticate, getDashboardStats);

module.exports = router;
