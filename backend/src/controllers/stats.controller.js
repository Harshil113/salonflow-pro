const pool = require('../config/database');

exports.getDashboardStats = async (req, res) => {
  try {
    const salonId = req.user.salon_id;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // 1. Total Revenue Today (from transactions)
    const revenueResult = await pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) as total 
       FROM transactions 
       WHERE salon_id = $1 AND DATE(created_at) = $2 AND status = 'completed'`,
      [salonId, today]
    );
    const revenue = parseFloat(revenueResult.rows[0].total);

    // 2. Appointments Today
    const apptResult = await pool.query(
      `SELECT COUNT(*) as count 
       FROM appointments 
       WHERE salon_id = $1 AND DATE(start_time) = $2`,
      [salonId, today]
    );
    const appointments = parseInt(apptResult.rows[0].count);

    // 3. New Clients (Created this month)
    const clientsResult = await pool.query(
      `SELECT COUNT(*) as count 
       FROM clients 
       WHERE salon_id = $1 AND DATE(created_at) >= NOW() - INTERVAL '30 days'`,
      [salonId]
    );
    const newClients = parseInt(clientsResult.rows[0].count);

    // 4. Growth (Mock calculation for now: % change vs last week)
    // In a real app, you'd compare this week vs last week revenue
    const growth = 12.5; 

    res.json({
      success: true,
      data: {
        revenue,
        appointments,
        newClients,
        growth
      }
    });

  } catch (err) {
    console.error('Stats Error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
};
