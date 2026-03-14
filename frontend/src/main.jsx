import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Login from './Login.jsx';
import POS from './POS.jsx';

function Dashboard({ user, onLogout, onGoToPOS }) {
  const [stats, setStats] = useState({ revenue: 0, appointmentsToday: 0, pendingAppointments: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, recentRes] = await Promise.all([
          fetch('http://localhost:5000/api/stats'),
          fetch('http://localhost:5000/api/appointments/recent')
        ]);
        const statsData = await statsRes.json();
        const recentData = await recentRes.json();
        setStats(statsData);
        setRecent(recentData);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{textAlign:'center', marginTop:'50px'}}>Loading Dashboard...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', background: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#1f2937' }}>👋 Welcome, {user.name}</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onGoToPOS} style={{ padding: '10px 20px', background: '#764ba2', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>💰 New Sale (POS)</button>
          <button onClick={onLogout} style={{ padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Logout</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Today's Revenue</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>${stats.revenue.toFixed(2)}</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Appointments Today</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>{stats.appointmentsToday}</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Pending</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{stats.pendingAppointments}</p>
        </div>
      </div>

      {/* Recent Appointments Table */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: '15px', color: '#374151' }}>Recent Appointments</h3>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '10px', color: '#6b7280' }}>Client</th>
              <th style={{ padding: '10px', color: '#6b7280' }}>Service</th>
              <th style={{ padding: '10px', color: '#6b7280' }}>Price</th>
              <th style={{ padding: '10px', color: '#6b7280' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {recent.map(appt => (
              <tr key={appt.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '10px' }}>{appt.client_name}</td>
                <td style={{ padding: '10px' }}>{appt.service}</td>
                <td style={{ padding: '10px' }}>${parseFloat(appt.price).toFixed(2)}</td>
                <td style={{ padding: '10px' }}>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                    background: appt.status === 'completed' ? '#d1fae5' : appt.status === 'confirmed' ? '#dbeafe' : '#fef3c7',
                    color: appt.status === 'completed' ? '#065f46' : appt.status === 'confirmed' ? '#1e40af' : '#92400e'
                  }}>{appt.status.toUpperCase()}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'pos'

  if (!user) return <Login onLogin={setUser} />;
  
  if (view === 'pos') {
    return <POS onBack={() => setView('dashboard')} />;
  }

  return <Dashboard user={user} onLogout={() => setUser(null)} onGoToPOS={() => setView('pos')} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
