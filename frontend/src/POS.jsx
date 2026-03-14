import React, { useState, useEffect } from 'react';

function POS({ onBack }) {
  const [services, setServices] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/services')
      .then(res => res.json())
      .then(data => { setServices(data); setLoading(false); })
      .catch(err => console.error(err));
  }, []);

  const addToCart = (service) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === service.id);
      if (existing) {
        return prev.map(item => item.id === service.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...service, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const tax = subtotal * 0.08; // 8% Tax
  const total = subtotal + tax;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setProcessing(true);
    setMessage('');

    try {
      const items = cart.map(item => ({ service_id: item.id, qty: item.qty, price: item.price }));
      const res = await fetch('http://localhost:5000/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, totalAmount: total })
      });
      const data = await res.json();
      if (data.success) {
        setMessage('✅ Sale Completed! Receipt saved.');
        setCart([]);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ Error processing sale.');
      }
    } catch (err) {
      setMessage('❌ Server error.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div>Loading Services...</div>;

  return (
    <div style={{ display: 'flex', height: '90vh', fontFamily: 'sans-serif', background: '#f3f4f6' }}>
      {/* Left: Service Menu */}
      <div style={{ flex: 2, padding: '20px', overflowY: 'auto' }}>
        <button onClick={onBack} style={{ marginBottom: '20px', padding: '8px 16px', cursor: 'pointer' }}>← Back to Dashboard</button>
        <h2 style={{ marginBottom: '20px' }}>Select Services</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
          {services.map(s => (
            <div key={s.id} onClick={() => addToCart(s)} style={{
              background: 'white', padding: '15px', borderRadius: '8px', cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)', transition: 'transform 0.2s'
            }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>{s.name}</h3>
              <p style={{ margin: 0, color: '#10b981', fontWeight: 'bold' }}>${parseFloat(s.price).toFixed(2)}</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#6b7280' }}>{s.duration_min} mins</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Cart */}
      <div style={{ flex: 1, background: 'white', padding: '20px', borderLeft: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ marginTop: 0 }}>Current Sale</h2>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {cart.length === 0 ? <p style={{ color: '#9ca3af' }}>Cart is empty</p> : (
            cart.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #f3f4f6', paddingBottom: '10px' }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>${parseFloat(item.price).toFixed(2)} x {item.qty}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button onClick={() => updateQty(item.id, -1)} style={{ width: '24px', height: '24px', cursor: 'pointer' }}>-</button>
                  <span>{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)} style={{ width: '24px', height: '24px', cursor: 'pointer' }}>+</button>
                  <button onClick={() => removeFromCart(item.id)} style={{ marginLeft: '8px', color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#6b7280' }}><span>Tax (8%):</span><span>${tax.toFixed(2)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}><span>Total:</span><span>${total.toFixed(2)}</span></div>
          
          {message && <div style={{ textAlign: 'center', marginBottom: '10px', color: message.includes('✅') ? 'green' : 'red', fontWeight: 'bold' }}>{message}</div>}
          
          <button 
            onClick={handleCheckout} 
            disabled={cart.length === 0 || processing}
            style={{ width: '100%', padding: '15px', background: cart.length === 0 ? '#9ca3af' : '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: cart.length === 0 ? 'not-allowed' : 'pointer' }}
          >
            {processing ? 'Processing...' : 'Complete Sale'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default POS;
