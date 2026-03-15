const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const errorHandler = require('./middleware/errorHandler');
const pool = require('./config/database');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => res.json({ message: 'SalonFlow Pro API v2.0', status: 'running' }));
app.get('/api/health', async (req, res) => {
  try { await pool.query('SELECT NOW()'); res.json({ status: 'OK' }); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});

// --- ROUTES ---
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/clients', require('./routes/client.routes'));
app.use('/api/services', require('./routes/service.routes'));
app.use('/api/stats', require('./routes/stats.routes'));
app.use('/api/pos', require('./routes/pos.routes'));
app.use('/api/appointments', require('./routes/appointment.routes')); // NEW CALENDAR ROUTE

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📅 Appointments endpoint ready at /api/appointments`);
});

module.exports = app;
