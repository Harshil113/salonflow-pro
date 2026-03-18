const PDFDocument = require('pdfkit');
const pool = require('../config/database');

exports.generateReceipt = async (req, res) => {
  const { id } = req.params;
  const { type } = req.query;

  try {
    if (type !== 'transaction') return res.status(400).json({ msg: 'Invalid type' });

    // 1. Get Transaction & Join Data
    const txRes = await pool.query(
      `SELECT t.id, t.created_at, c.first_name, c.last_name, c.email, c.phone,
              s.name as salon_name, s.address, s.phone as salon_phone
       FROM transactions t
       LEFT JOIN clients c ON t.client_id = c.id
       LEFT JOIN salons s ON t.salon_id = s.id
       WHERE t.id = $1`,
      [id]
    );

    if (txRes.rows.length === 0) return res.status(404).json({ msg: 'Transaction not found' });
    const tx = txRes.rows[0];

    // 2. Get Items
    const itemsRes = await pool.query(
      `SELECT name, quantity, unit_price, total_price 
       FROM transaction_items 
       WHERE transaction_id = $1`,
      [id]
    );
    const items = itemsRes.rows;

    // 3. Calculate Totals Safely in JS
    let calcSubtotal = 0;
    const safeItems = items.map((item) => {
      const qty = (item.quantity === null || item.quantity === undefined) ? 1 : Number(item.quantity);
      const price = (item.unit_price === null || item.unit_price === undefined) ? 0 : Number(item.unit_price);
      const total = (item.total_price === null || item.total_price === undefined) ? 0 : Number(item.total_price);
      
      calcSubtotal += total;
      return { 
        name: String(item.name || 'Item').substring(0, 30), // Truncate long names
        qty: isNaN(qty) ? 1 : qty, 
        price: isNaN(price) ? 0 : price, 
        total: isNaN(total) ? 0 : total 
      };
    });

    const finalSub = isNaN(calcSubtotal) ? 0 : calcSubtotal;
    const finalTax = finalSub * 0.08; // Default 8% tax
    const finalTot = finalSub + finalTax;

    // 4. Prepare Strings
    const salonName = String(tx.salon_name || "SalonFlow Pro");
    const salonAddress = String(tx.address || "123 Main St");
    const clientName = (tx.first_name && tx.last_name) ? `${tx.first_name} ${tx.last_name}` : "Valued Customer";

    // 5. Create PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    
    doc.on('error', (err) => {
      console.error("PDF Generation Error:", err.message);
      if (!res.headersSent) res.status(500).send("Failed to generate PDF");
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${id}.pdf`);
    doc.pipe(res);

    // --- DRAWING ---

    // Header
    doc.fontSize(22).font('Helvetica-Bold').text(salonName, { align: 'center' });
    doc.fontSize(12).font('Helvetica').text(salonAddress, { align: 'center' });
    if (tx.salon_phone) doc.text(String(tx.salon_phone), { align: 'center' });
    doc.moveDown(2);

    // Receipt Info (Right Aligned)
    doc.fontSize(16).font('Helvetica-Bold').text("RECEIPT", 450, doc.y, { align: 'right' });
    doc.fontSize(10).font('Helvetica').text(`Date: ${new Date(tx.created_at).toLocaleDateString()}`, 450, doc.y, { align: 'right' });
    doc.text(`Receipt #: ${tx.id}`, 450, doc.y, { align: 'right' });
    doc.moveDown(2);

    // Client Info
    doc.font('Helvetica-Bold').text("Bill To:");
    doc.font('Helvetica').text(clientName);
    if (tx.email) doc.text(String(tx.email));
    if (tx.phone) doc.text(String(tx.phone));
    doc.moveDown(2);

    // Table Header (Absolute Positioning)
    let y = doc.y;
    doc.font('Helvetica-Bold');
    doc.text("Description", 50, y);
    doc.text("Qty", 310, y);
    doc.text("Price", 370, y);
    doc.text("Total", 460, y);
    doc.moveTo(50, y + 15).lineTo(540, y + 15).stroke();
    
    let currentY = y + 25;

    // Items Loop (Absolute Positioning - No layout options to prevent NaN errors)
    if (safeItems.length === 0) {
      doc.text("No items found", 50, currentY);
      currentY += 20;
    } else {
      safeItems.forEach((item) => {
        const priceStr = "$" + item.price.toFixed(2);
        const totalStr = "$" + item.total.toFixed(2);
        
        doc.font('Helvetica').text(item.name, 50, currentY); 
        doc.text(String(item.qty), 310, currentY);
        doc.text(priceStr, 370, currentY);
        doc.text(totalStr, 460, currentY);
        
        currentY += 20;
      });
    }

    // Totals Section
    const finalY = currentY + 20;
    doc.moveTo(50, finalY).lineTo(540, finalY).stroke();
    
    doc.font('Helvetica').text("Subtotal:", 370, finalY + 10);
    doc.text("$" + finalSub.toFixed(2), 460, finalY + 10);
    
    doc.text("Tax (8%):", 370, finalY + 30);
    doc.text("$" + finalTax.toFixed(2), 460, finalY + 30);
    
    doc.font('Helvetica-Bold').fontSize(14).text("TOTAL:", 370, finalY + 50);
    doc.text("$" + finalTot.toFixed(2), 460, finalY + 50);

    // Footer
    doc.fontSize(10).font('Helvetica-Oblique').text("Thank you for your business!", 275, finalY + 100, { align: 'center' });
    
    doc.end();

  } catch (err) {
    console.error("Receipt Controller Error:", err);
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
};
