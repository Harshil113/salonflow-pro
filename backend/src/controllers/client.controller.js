const pool = require('../config/database');

// Get all clients
exports.getClients = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM clients WHERE salon_id = $1 ORDER BY last_name ASC', 
      [req.user.salon_id]
    );
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get single client by ID (with history)
exports.getClientById = async (req, res) => {
  try {
    const clientId = req.params.id;
    const salonId = req.user.salon_id;

    // 1. Get Client Details
    const clientRes = await pool.query(
      'SELECT * FROM clients WHERE id = $1 AND salon_id = $2', 
      [clientId, salonId]
    );
    
    if (clientRes.rows.length === 0) {
      return res.status(404).json({ success: false, msg: 'Client not found' });
    }
    const client = clientRes.rows[0];

    // 2. Get Visit History
    const historyRes = await pool.query(
      `SELECT a.id, a.start_time, a.status, a.total_amount, s.name as service_name, u.first_name as staff_first, u.last_name as staff_last
       FROM appointments a
       JOIN services s ON a.service_id = s.id
       JOIN users u ON a.staff_id = u.id
       WHERE a.client_id = $1 AND a.salon_id = $2
       ORDER BY a.start_time DESC
       LIMIT 10`,
      [clientId, salonId]
    );

    // 3. Get Transaction History
    const transRes = await pool.query(
      `SELECT id, total_amount, created_at, payment_method 
       FROM transactions 
       WHERE client_id = $1 AND salon_id = $2 
       ORDER BY created_at DESC 
       LIMIT 10`,
      [clientId, salonId]
    );

    res.json({ 
      success: true, 
      data: { 
        ...client, 
        appointments: historyRes.rows, 
        transactions: transRes.rows 
      } 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Create new client
exports.createClient = async (req, res) => {
  const { first_name, last_name, email, phone, notes, vip_status } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO clients (salon_id, first_name, last_name, email, phone, notes, vip_status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.user.salon_id, first_name, last_name, email, phone, notes || '', vip_status || 'regular']
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update client
exports.updateClient = async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, phone, notes, vip_status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE clients SET first_name=$1, last_name=$2, email=$3, phone=$4, notes=$5, vip_status=$6, updated_at=NOW()
       WHERE id=$7 AND salon_id=$8 RETURNING *`,
      [first_name, last_name, email, phone, notes, vip_status, id, req.user.salon_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, msg: 'Not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
