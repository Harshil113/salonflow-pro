import React, { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => alert('Logout clicked')} />
      
      <main className="ml-64 flex-1 p-8 overflow-y-auto h-screen">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab !== 'dashboard' && (
          <div className="text-center mt-20 text-gray-500">
            <h2 className="text-2xl font-bold mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
            <p>Module coming in next phase...</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
