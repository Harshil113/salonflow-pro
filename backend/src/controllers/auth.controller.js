const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check if user exists
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, msg: 'Invalid Credentials' });
    }

    const user = result.rows[0];

    // 2. Validate password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, msg: 'Invalid Credentials' });
    }

    // 3. Create JWT Payload
    const payload = {
      user: {
        id: user.id,
        salon_id: user.salon_id,
        role: user.role,
        name: `${user.first_name} ${user.last_name}`
      }
    };

    // 4. Sign Token
    jwt.sign(
      payload, 
      process.env.JWT_SECRET || 'secretkey', 
      { expiresIn: '24h' }, 
      (err, token) => {
        if (err) throw err;
        res.json({ 
          success: true, 
          token, 
          user: {
            id: user.id,
            name: payload.user.name,
            email: user.email,
            role: user.role,
            salon_id: user.salon_id
          }
        });
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
