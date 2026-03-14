import React from 'react';
import { LayoutDashboard, Users, Calendar, CreditCard, Package, Settings, LogOut } from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
  { icon: Calendar, label: 'Calendar', id: 'calendar' },
  { icon: CreditCard, label: 'POS', id: 'pos' },
  { icon: Users, label: 'Clients', id: 'clients' },
  { icon: Package, label: 'Inventory', id: 'inventory' },
  { icon: Settings, label: 'Settings', id: 'settings' },
];

export default function Sidebar({ activeTab, setActiveTab, onLogout }) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">SalonFlow</h1>
        <p className="text-xs text-gray-400 mt-1">Pro Studio</p>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === item.id ? 'bg-primary-50 text-primary-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-100">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">
          <LogOut size={20} /> Logout
        </button>
      </div>
    </div>
  );
}
