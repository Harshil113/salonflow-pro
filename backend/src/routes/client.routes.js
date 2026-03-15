const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getClients, getClientById, createClient, updateClient } = require('../controllers/client.controller');

router.use(auth);
router.get('/', getClients);
router.get('/:id', getClientById);
router.post('/', createClient);
router.put('/:id', updateClient);

module.exports = router;
