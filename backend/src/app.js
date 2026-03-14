const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const pool = new Pool({
  user: process.env.DB_USER || 'mac', // Your Mac username
  host: 'localhost',
  database: 'salonflow',
  password: process.env.DB_PASSWORD || '',
  port: 5432,
});

// Test Route
app.get('/', (req, res) => {
  res.json({ message: '🚀 SalonFlow Pro API is Running!', status: 'OK' });
});

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT NOW()');
    res.json({ status: 'Database Connected', time: new Date() });
  } catch (err) {
    res.status(500).json({ status: 'Database Error', error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📡 API Ready at http://localhost:${PORT}/api/health`);
});
