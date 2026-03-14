import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import Login from './Login';

function Dashboard({ user, onLogout }) {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
      <h1>🚀 Welcome, {user.email}!</h1>
      <p style={{ fontSize: '18px', color: '#555' }}>You are now logged into SalonFlow Pro.</p>
      <div style={{ marginTop: '30px' }}>
        <div style={{ display: 'inline-block', padding: '20px', background: '#f0fdf4', border: '1px solid #22c55e', borderRadius: '8px', color: '#15803d' }}>
          ✅ Backend Connected
        </div>
      </div>
      <button 
        onClick={onLogout}
        style={{ marginTop: '30px', padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
      >
        Logout
      </button>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return user ? <Dashboard user={user} onLogout={handleLogout} /> : <Login onLogin={handleLogin} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
