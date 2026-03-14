const pool = require('../config/database');

// @desc    Get all services for a salon
// @route   GET /api/services
exports.getServices = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM services WHERE salon_id = $1 AND is_active = true ORDER BY category, name', 
      [req.user.salon_id]
    );
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
