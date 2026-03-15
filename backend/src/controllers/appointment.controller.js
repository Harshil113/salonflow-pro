const pool = require('../config/database');

// Get Appointments for Calendar (Default: Today)
exports.getAppointments = async (req, res) => {
  try {
    const { date } = req.query; // Format: YYYY-MM-DD
    const salonId = req.user.salon_id;
    
    // If no date provided, default to today
    const targetDate = date || new Date().toISOString().split('T')[0];
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const result = await pool.query(
      `SELECT 
        a.id, a.start_time, a.end_time, a.status, a.notes, a.total_amount,
        c.first_name as client_first, c.last_name as client_last, c.phone,
        s.name as service_name, s.duration, s.price,
        u.first_name as staff_first, u.last_name as staff_last, u.color_code
       FROM appointments a
       JOIN clients c ON a.client_id = c.id
       JOIN services s ON a.service_id = s.id
       JOIN users u ON a.staff_id = u.id
       WHERE a.salon_id = $1 
         AND a.start_time >= $2 
         AND a.start_time < $3
       ORDER BY a.start_time ASC`,
      [salonId, targetDate, nextDay.toISOString().split('T')[0]]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Create New Appointment
exports.createAppointment = async (req, res) => {
  const { client_id, staff_id, service_id, start_time, notes } = req.body;
  const salonId = req.user.salon_id;

  try {
    // 1. Get Service Duration
    const serviceRes = await pool.query('SELECT duration, price FROM services WHERE id = $1', [service_id]);
    if (serviceRes.rows.length === 0) return res.status(404).json({ msg: 'Service not found' });
    
    const duration = serviceRes.rows[0].duration; // in minutes
    const price = serviceRes.rows[0].price;
    
    // 2. Calculate End Time
    const startTimeObj = new Date(start_time);
    const endTimeObj = new Date(startTimeObj.getTime() + duration * 60000);

    // 3. Check for Conflicts (Simple overlap check)
    const conflictRes = await pool.query(
      `SELECT id FROM appointments 
       WHERE staff_id = $1 
       AND salon_id = $2
       AND status != 'cancelled'
       AND (
         (start_time < $3 AND end_time > $4) OR 
         (start_time >= $4 AND start_time < $3)
       )`,
      [staff_id, salonId, endTimeObj, startTimeObj]
    );

    if (conflictRes.rows.length > 0) {
      return res.status(400).json({ success: false, msg: 'Time slot conflicts with an existing appointment!' });
    }

    // 4. Insert Appointment
    const result = await pool.query(
      `INSERT INTO appointments 
       (salon_id, client_id, staff_id, service_id, start_time, end_time, notes, total_amount, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'scheduled')
       RETURNING *`,
      [salonId, client_id, staff_id, service_id, startTimeObj, endTimeObj, notes, price]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update Status (Complete/Cancel)
exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'completed', 'cancelled', 'no_show'
  
  try {
    const result = await pool.query(
      `UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    
    // If completed, we could trigger inventory deduction or loyalty points here later
    
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
