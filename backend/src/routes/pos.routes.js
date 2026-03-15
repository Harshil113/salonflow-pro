const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createSale, getServicesAndProducts } = require('../controllers/pos.controller');

router.use(auth);
router.post('/checkout', createSale);
router.get('/menu', getServicesAndProducts);

module.exports = router;
