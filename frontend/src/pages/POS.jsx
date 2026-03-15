import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Minus, Trash2, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';

export default function POS() {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Fetch Menu
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:5000/api/pos/menu', {
      headers: { 'x-auth-token': token }
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        // Combine services and products, and ensure price is a number
        const allItems = [
          ...data.data.services, 
          ...data.data.products
        ].map(item => ({
          ...item,
          price: parseFloat(item.price) || 0 // Convert string to number
        }));
        setMenuItems(allItems);
      }
      setLoading(false);
    })
    .catch(err => { console.error(err); setLoading(false); });
  }, []);

  // Add to Cart
  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  // Update Quantity
  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  // Remove from Cart
  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Calculate Totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  // Checkout
  const handleCheckout = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/pos/checkout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token 
        },
        body: JSON.stringify({
          items: cart,
          payment_method: 'cash',
          tip_amount: 0,
          discount_amount: 0
        })
      });
      const data = await res.json();
      if (data.success) {
        setCheckoutSuccess(true);
        setCart([]);
        setTimeout(() => setCheckoutSuccess(false), 3000);
      } else {
        alert('Checkout failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Network error: ' + err.message);
    }
  };

  const filteredItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Menu...</div>;

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-6 overflow-hidden">
      
      {/* LEFT: Product Grid */}
      <div className="flex-1 flex flex-col">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Services & Products</h2>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search menu..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pb-4">
          {filteredItems.length === 0 ? (
            <p className="text-gray-500 col-span-full text-center mt-10">No items found.</p>
          ) : (
            filteredItems.map(item => (
              <motion.div
                key={item.id}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => addToCart(item)}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all flex flex-col justify-between h-48"
              >
                <div>
                  <div className="h-20 bg-gray-50 rounded-lg mb-3 flex items-center justify-center text-3xl">
                    {item.type === 'service' ? '✂️' : '🧴'}
                  </div>
                  <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                  <p className="text-xs text-gray-500 capitalize">{item.category || 'General'}</p>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-bold text-primary-600">${item.price.toFixed(2)}</span>
                  <button className="p-2 bg-primary-50 text-primary-600 rounded-full hover:bg-primary-100 transition-colors">
                    <Plus size={18} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT: Cart */}
      <div className="w-96 bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Current Order</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center text-gray-400 mt-10">
              <p className="text-lg">Cart is empty</p>
              <p className="text-sm">Click items to add</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.id, -1)} className="p-1 bg-white rounded shadow hover:text-red-500 transition-colors"><Minus size={14}/></button>
                  <span className="w-4 text-center text-sm font-medium">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="p-1 bg-white rounded shadow hover:text-green-500 transition-colors"><Plus size={14}/></button>
                  <button onClick={() => removeFromCart(item.id)} className="ml-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-gray-50 rounded-b-2xl border-t border-gray-100">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <Button 
            onClick={handleCheckout} 
            disabled={cart.length === 0}
            className={`w-full py-3 text-lg ${cart.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {checkoutSuccess ? <span className="flex items-center justify-center gap-2"><CheckCircle size={20}/> Success!</span> : 'Complete Sale'}
          </Button>
        </div>
      </div>

    </div>
  );
}
