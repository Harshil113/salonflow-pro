import React, { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Clients from './pages/Clients'; // Import Clients

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => alert('Logout')} />
      
      <main className="ml-64 flex-1 p-8 overflow-y-auto h-screen">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'pos' && <POS />}
        {activeTab === 'clients' && <Clients />} {/* Add Clients Page */}
        {activeTab !== 'dashboard' && activeTab !== 'pos' && activeTab !== 'clients' && (
          <div className="text-center mt-20 text-gray-500">
            <h2 className="text-2xl font-bold mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
            <p>Module coming soon...</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
