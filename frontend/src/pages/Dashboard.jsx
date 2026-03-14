import React from 'react';
import { DollarSign, Users, Calendar, TrendingUp } from 'lucide-react';
import Card from '../components/ui/Card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
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
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500">Welcome back, here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={DollarSign} label="Today's Revenue" value="$1,234" color="bg-gradient-to-br from-green-400 to-emerald-600" />
        <StatCard icon={Calendar} label="Appointments" value="12" color="bg-gradient-to-br from-blue-400 to-indigo-600" />
        <StatCard icon={Users} label="New Clients" value="5" color="bg-gradient-to-br from-purple-400 to-pink-600" />
        <StatCard icon={TrendingUp} label="Growth" value="+12%" color="bg-gradient-to-br from-orange-400 to-red-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 min-h-[400px]">
          <h3 className="text-lg font-semibold mb-6">Revenue Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
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
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 pb-3 border-b border-gray-50 last:border-0">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                  {['SC', 'MJ', 'EW', 'AL'][i-1]}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{['Sophie Chen', 'Marcus Johnson', 'Emma Wilson', 'Alex Rivera'][i-1]}</p>
                  <p className="text-xs text-gray-500">Completed Service • $45</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
