const pool = require('../config/database');

// @desc    Get all clients for a salon
// @route   GET /api/clients
exports.getClients = async (req, res) => {
  try {
    // Filter by salon_id from authenticated user
    const result = await pool.query(
      'SELECT * FROM clients WHERE salon_id = $1 ORDER BY last_name ASC', 
      [req.user.salon_id]
    );
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get single client by ID
// @route   GET /api/clients/:id
exports.getClientById = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM clients WHERE id = $1 AND salon_id = $2', 
      [req.params.id, req.user.salon_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, msg: 'Client not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Create new client
// @route   POST /api/clients
exports.createClient = async (req, res) => {
  const { first_name, last_name, email, phone, notes, vip_status } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO clients (salon_id, first_name, last_name, email, phone, notes, vip_status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.user.salon_id, first_name, last_name, email, phone, notes, vip_status || 'regular']
    );
    
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
