const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getClients, getClientById, createClient } = require('../controllers/client.controller');

// All routes protected by auth middleware
router.use(auth); 

router.get('/', getClients);
router.get('/:id', getClientById);
router.post('/', createClient);

module.exports = router;
