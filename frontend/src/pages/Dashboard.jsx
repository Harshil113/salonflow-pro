import React, { useState, useEffect } from 'react';
import { DollarSign, Users, Calendar, TrendingUp } from 'lucide-react';
import Card from '../components/ui/Card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { name: 'Mon', revenue: 400 }, { name: 'Tue', revenue: 300 },
  { name: 'Wed', revenue: 550 }, { name: 'Thu', revenue: 450 },
  { name: 'Fri', revenue: 700 }, { name: 'Sat', revenue: 900 },
  { name: 'Sun', revenue: 600 },
];

const StatCard = ({ icon: Icon, label, value, color }) => (
  <Card hover className="flex items-center gap-4">
    <div className={`p-3 rounded-lg ${color}`}><Icon size={24} className="text-white" /></div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </Card>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null); // Start as null to force loading state
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError("No token found. Please log in.");
        return;
      }

      try {
        console.log("🚀 Fetching stats with token...", token.substring(0, 20) + "...");
        const response = await fetch('http://localhost:5000/api/stats', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("✅ Data received:", result);
        
        if (result.success) {
          setStats(result.data);
        } else {
          setError("Failed to get success response");
        }
      } catch (err) {
        console.error("❌ Fetch error:", err);
        setError(err.message);
      }
    };

    fetchStats();
  }, []); // Empty dependency array means run once on mount

  // Show Loading State
  if (stats === null && !error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">Loading real-time data...</p>
        </div>
      </div>
    );
  }

  // Show Error State
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-500">
          <p className="text-xl font-bold">Error Loading Data</p>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded">Retry</button>
        </div>
      </div>
    );
  }

  // Show Data
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500">Live data from your salon database.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={DollarSign} label="Today's Revenue" value={`$${stats.revenue.toFixed(2)}`} color="bg-gradient-to-br from-green-400 to-emerald-600" />
        <StatCard icon={Calendar} label="Appointments" value={stats.appointments} color="bg-gradient-to-br from-blue-400 to-indigo-600" />
        <StatCard icon={Users} label="New Clients" value={stats.newClients} color="bg-gradient-to-br from-purple-400 to-pink-600" />
        <StatCard icon={TrendingUp} label="Growth" value={`+${stats.growth}%`} color="bg-gradient-to-br from-orange-400 to-red-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 min-h-[400px]">
          <h3 className="text-lg font-semibold mb-6">Revenue Overview (Demo Data)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} dx={-10} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Line type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={3} dot={{ r: 4, fill: '#7c3aed', stroke: '#fff' }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
             <p className="text-sm text-gray-500 text-center py-4">No transactions recorded today.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
