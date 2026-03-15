const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getDashboardStats } = require('../controllers/stats.controller');

router.use(auth); // Protect this route
router.get('/', getDashboardStats);

module.exports = router;
