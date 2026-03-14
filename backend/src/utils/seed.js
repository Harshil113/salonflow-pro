const pool = require('../config/database');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  console.log('🌱 Starting Database Seeding...');

  try {
    // 1. Create Demo Salon
    const salonRes = await pool.query(
      `INSERT INTO salons (name, email, phone, address, timezone) 
       VALUES ('SalonFlow Demo Studio', 'demo@salonflow.com', '555-0123', '123 Fashion Ave, NY', 'America/New_York') 
       RETURNING id`
    );
    const salonId = salonRes.rows[0].id;
    console.log(`✅ Created Salon: ID ${salonId}`);

    // 2. Create Admin User
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash('password123', salt);
    
    await pool.query(
      `INSERT INTO users (salon_id, email, password_hash, first_name, last_name, role, commission_rate) 
       VALUES ($1, 'admin@salon.com', $2, 'Super', 'Admin', 'admin', 0)`,
      [salonId, hash]
    );
    console.log('✅ Created Admin User (admin@salon.com / password123)');

    // 3. Create Staff
    await pool.query(
      `INSERT INTO users (salon_id, email, password_hash, first_name, last_name, role, color_code) 
       VALUES 
       ($1, 'stylist1@salon.com', $2, 'Alex', 'Rivera', 'stylist', '#3b82f6'),
       ($1, 'stylist2@salon.com', $2, 'Jordan', 'Lee', 'stylist', '#10b981'),
       ($1, 'receptionist@salon.com', $2, 'Taylor', 'Smith', 'receptionist', '#f59e0b')`,
      [salonId, hash]
    );
    console.log('✅ Created 3 Staff Members');

    // 4. Create Clients
    await pool.query(
      `INSERT INTO clients (salon_id, first_name, last_name, email, phone, vip_status, notes) 
       VALUES 
       ($1, 'Sophie', 'Chen', 'sophie@example.com', '555-0199', 'gold', 'Allergic to latex gloves'),
       ($1, 'Marcus', 'Johnson', 'marcus@example.com', '555-0188', 'regular', 'Prefers short haircuts'),
       ($1, 'Emma', 'Wilson', 'emma@example.com', '555-0177', 'silver', 'Loves balayage')`,
      [salonId]
    );
    console.log('✅ Created 3 Demo Clients');

    // 5. Create Services
    await pool.query(
      `INSERT INTO services (salon_id, name, category, duration, price, description) 
       VALUES 
       ($1, 'Men''s Haircut', 'Hair', 30, 25.00, 'Classic cut and style'),
       ($1, 'Women''s Cut & Blowdry', 'Hair', 45, 45.00, 'Wash, cut, and blowdry'),
       ($1, 'Full Balayage', 'Color', 120, 120.00, 'Hand-painted highlights'),
       ($1, 'Gel Manicure', 'Nails', 45, 35.00, 'Long-lasting gel polish'),
       ($1, 'Deep Tissue Massage', 'Spa', 60, 80.00, 'Therapeutic massage'),
       ($1, 'Keratin Treatment', 'Treatment', 90, 150.00, 'Smoothing treatment')`,
      [salonId]
    );
    console.log('✅ Created 6 Services');

    // 6. Create Products
    await pool.query(
      `INSERT INTO products (salon_id, name, category, cost_price, selling_price, stock_quantity, reorder_point) 
       VALUES 
       ($1, 'Shampoo - Volumizing', 'Retail', 5.00, 18.00, 20, 5),
       ($1, 'Conditioner - Moisturizing', 'Retail', 5.00, 18.00, 15, 5),
       ($1, 'Hair Serum', 'Retail', 8.00, 28.00, 8, 10),
       ($1, 'Styling Gel', 'Retail', 3.00, 12.00, 30, 10)`,
      [salonId]
    );
    console.log('✅ Created 4 Products');

    console.log('🎉 Seeding Completed Successfully!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Seeding Failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedDatabase();
