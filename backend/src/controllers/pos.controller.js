const pool = require('../config/database');

exports.createSale = async (req, res) => {
  const client = await pool.connect();
  try {
    const { items, payment_method, tip_amount, discount_amount } = req.body;
    const salon_id = req.user.salon_id;
    const staff_id = req.user.id;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, msg: 'Cart is empty' });
    }

    // Calculate totals
    let subtotal = 0;
    items.forEach(item => {
      subtotal += (item.price * item.quantity);
    });

    const tax_rate = 0.08; // 8% Tax
    const tax_amount = subtotal * tax_rate;
    const total_amount = subtotal + tax_amount + (tip_amount || 0) - (discount_amount || 0);

    // Start Transaction
    await client.query('BEGIN');

    // 1. Create the Sale Record
    const saleRes = await client.query(
      `INSERT INTO transactions 
       (salon_id, staff_id, payment_method, subtotal, tax_amount, tip_amount, discount_amount, total_amount, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'completed') 
       RETURNING id`,
      [salon_id, staff_id, payment_method || 'cash', subtotal, tax_amount, tip_amount || 0, discount_amount || 0, total_amount]
    );
    const transaction_id = saleRes.rows[0].id;

    // 2. Create Sale Items
    for (const item of items) {
      await client.query(
        `INSERT INTO transaction_items 
         (transaction_id, item_type, item_id, name, quantity, unit_price, total_price) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [transaction_id, item.type, item.id, item.name, item.quantity, item.price, item.price * item.quantity]
      );
      
      // Optional: If it's a product, reduce stock here later
      if (item.type === 'product') {
         await client.query(
           `UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2 AND salon_id = $3`,
           [item.quantity, item.id, salon_id]
         );
      }
    }

    await client.query('COMMIT');

    res.json({ 
      success: true, 
      msg: 'Sale completed successfully!', 
      data: { transaction_id, total_amount } 
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POS Error:', err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
};

exports.getServicesAndProducts = async (req, res) => {
  try {
    const salon_id = req.user.salon_id;
    
    const services = await pool.query(
      'SELECT id, name, price, duration, category FROM services WHERE salon_id = $1 AND is_active = true', 
      [salon_id]
    );
    
    const products = await pool.query(
      'SELECT id, name, selling_price as price, category FROM products WHERE salon_id = $1 AND is_active = true AND stock_quantity > 0', 
      [salon_id]
    );

    res.json({
      success: true,
      data: {
        services: services.rows.map(r => ({ ...r, type: 'service' })),
        products: products.rows.map(r => ({ ...r, type: 'product' }))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
