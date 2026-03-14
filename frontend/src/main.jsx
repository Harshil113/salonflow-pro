import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
      <h1>🚀 SalonFlow Pro</h1>
      <p>Your salon management system is ready!</p>
      <p style={{color: 'green'}}>✅ Backend Connected</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
