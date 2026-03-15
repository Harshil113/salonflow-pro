const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getAppointments, createAppointment, updateStatus } = require('../controllers/appointment.controller');

router.use(auth);
router.get('/', getAppointments);
router.post('/', createAppointment);
router.put('/:id/status', updateStatus);

module.exports = router;
