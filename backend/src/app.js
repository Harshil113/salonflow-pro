const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER || 'mac',
  host: 'localhost',
  database: 'salonflow',
  password: process.env.DB_PASSWORD || '',
  port: 5432,
});

// --- AUTH ---
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    res.json({ success: true, user: { id: user.id, email: user.email, name: user.first_name, role: user.role } });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// --- DASHBOARD STATS ---
app.get('/api/stats', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const revenueRes = await pool.query("SELECT COALESCE(SUM(total_amount), 0) as total FROM sales WHERE status = 'completed' AND DATE(created_at) = $1", [today]);
    const apptRes = await pool.query("SELECT COUNT(*) as count FROM appointments WHERE DATE(appointment_date) = $1", [today]);
    const pendingRes = await pool.query("SELECT COUNT(*) as count FROM appointments WHERE status = 'pending'");
    res.json({
      revenue: parseFloat(revenueRes.rows[0].total),
      appointmentsToday: parseInt(apptRes.rows[0].count),
      pendingAppointments: parseInt(pendingRes.rows[0].count)
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/appointments/recent', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM appointments ORDER BY appointment_date DESC LIMIT 5");
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- NEW: POS ROUTES ---

// 1. Get All Services
app.get('/api/services', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM services ORDER BY name');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. Process Sale (Checkout)
app.post('/api/sales', async (req, res) => {
  const { items, totalAmount, customerId } = req.body; // items = [{service_id, qty, price}]
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Insert into Sales table
    const saleRes = await client.query(
      `INSERT INTO sales (total_amount, status, created_at) VALUES ($1, 'completed', NOW()) RETURNING id`,
      [totalAmount]
    );
    const saleId = saleRes.rows[0].id;

    // Insert Sale Items
    for (const item of items) {
      await client.query(
        `INSERT INTO sale_items (sale_id, service_id, quantity, price_at_sale) VALUES ($1, $2, $3, $4)`,
        [saleId, item.service_id, item.qty, item.price]
      );
    }

    await client.query('COMMIT');
    res.json({ success: true, saleId, message: 'Sale completed successfully!' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to process sale' });
  } finally {
    client.release();
  }
});

// Create Sales Tables if not exists (Run once automatically)
const initTables = async () => {
  await pool.query(`CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY, total_amount DECIMAL(10,2), status VARCHAR(20), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS sale_items (
    id SERIAL PRIMARY KEY, sale_id INT REFERENCES sales(id), service_id INT REFERENCES services(id), quantity INT, price_at_sale DECIMAL(10,2)
  )`);
};
initTables();

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`💰 POS System Ready`);
});
