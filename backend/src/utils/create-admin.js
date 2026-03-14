const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  user: process.env.DB_USER || 'mac',
  host: 'localhost',
  database: 'salonflow',
  password: process.env.DB_PASSWORD || '',
  port: 5432,
});

async function createAdmin() {
  const email = 'admin@salon.com';
  const plainPassword = 'password123'; // You can change this later
  const firstName = 'Salon';
  const role = 'owner';

  try {
    // 1. Hash the password (Salt rounds = 12)
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(plainPassword, salt);

    console.log('🔒 Generated secure hash for password...');

    // 2. Insert into database
    const query = `
      INSERT INTO users (email, password_hash, first_name, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO UPDATE SET password_hash = $2, first_name = $3, role = $4;
    `;
    
    await pool.query(query, [email, passwordHash, firstName, role]);

    console.log('✅ SUCCESS! Admin user created/updated in database.');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${plainPassword}`);
    console.log(`   Role: ${role}`);
    
  } catch (err) {
    console.error('❌ Error creating admin:', err.message);
  } finally {
    await pool.end();
  }
}

createAdmin();
