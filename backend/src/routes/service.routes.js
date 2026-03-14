const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getServices } = require('../controllers/service.controller');

router.use(auth); 
router.get('/', getServices);

module.exports = router;
