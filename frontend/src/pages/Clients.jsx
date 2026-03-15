import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, User, Phone, Mail, Calendar, DollarSign, Star, X, Edit2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({ first_name: '', last_name: '', phone: '', email: '', notes: '' });

  const token = localStorage.getItem('token');

  // Fetch Clients
  const fetchClients = () => {
    fetch('http://localhost:5000/api/clients', { headers: { 'x-auth-token': token } })
      .then(res => res.json())
      .then(data => { if(data.success) setClients(data.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchClients(); }, []);

  // Fetch Single Client Details
  const selectClient = (client) => {
    setSelectedClient({ ...client, loading: true });
    fetch(`http://localhost:5000/api/clients/${client.id}`, { headers: { 'x-auth-token': token } })
      .then(res => res.json())
      .then(data => {
        if (data.success) setSelectedClient({ ...data.data, loading: false });
      });
  };

  // Create Client
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify(newClient)
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setNewClient({ first_name: '', last_name: '', phone: '', email: '', notes: '' });
        fetchClients();
      }
    } catch (err) { alert('Error creating client'); }
  };

  const filtered = clients.filter(c => 
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const getVipColor = (status) => {
    if (status === 'gold') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (status === 'silver') return 'bg-gray-100 text-gray-800 border-gray-200';
    if (status === 'platinum') return 'bg-purple-100 text-purple-800 border-purple-200';
    return 'bg-blue-50 text-blue-700 border-blue-100';
  };

  if (loading) return <div className="p-8 text-center">Loading clients...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clients</h2>
          <p className="text-gray-500">{clients.length} clients in your database</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={20} /> Add Client
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search by name or phone..." 
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Client Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(client => (
          <Card key={client.id} hover className="cursor-pointer" onClick={() => selectClient(client)}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 font-bold text-lg">
                  {client.first_name[0]}{client.last_name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{client.first_name} {client.last_name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${getVipColor(client.vip_status)}`}>
                    {client.vip_status}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2"><Phone size={14}/> {client.phone}</div>
              <div className="flex items-center gap-2"><Mail size={14}/> {client.email || 'No email'}</div>
              <div className="flex items-center gap-2"><DollarSign size={14}/> Lifetime: ${parseFloat(client.lifetime_value || 0).toFixed(2)}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Client Detail Modal */}
      <AnimatePresence>
        {selectedClient && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedClient(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {selectedClient.loading ? (
                <div className="p-12 text-center">Loading details...</div>
              ) : (
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-white flex items-center justify-center text-2xl font-bold">
                        {selectedClient.first_name[0]}{selectedClient.last_name[0]}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{selectedClient.first_name} {selectedClient.last_name}</h2>
                        <p className="text-gray-500">{selectedClient.phone} • {selectedClient.email}</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedClient(null)} className="p-2 hover:bg-gray-100 rounded-full"><X size={24}/></button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-sm text-gray-500">Lifetime Value</p>
                      <p className="text-xl font-bold text-green-600">${parseFloat(selectedClient.lifetime_value || 0).toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-sm text-gray-500">Total Visits</p>
                      <p className="text-xl font-bold text-blue-600">{selectedClient.total_visits || 0}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Edit2 size={18}/> Notes</h3>
                    <p className="text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                      {selectedClient.notes || "No notes available."}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><Calendar size={18}/> Recent History</h3>
                    <div className="space-y-2">
                      {(selectedClient.appointments || []).length === 0 ? (
                        <p className="text-gray-400 text-sm">No appointments yet.</p>
                      ) : (
                        selectedClient.appointments.slice(0, 5).map(appt => (
                          <div key={appt.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{appt.service_name}</p>
                              <p className="text-xs text-gray-500">{new Date(appt.start_time).toLocaleDateString()} with {appt.staff_first}</p>
                            </div>
                            <span className="font-bold text-gray-700">${parseFloat(appt.total_amount || 0).toFixed(2)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Add New Client</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="First Name" className="border p-2 rounded" value={newClient.first_name} onChange={e => setNewClient({...newClient, first_name: e.target.value})} />
                <input required placeholder="Last Name" className="border p-2 rounded" value={newClient.last_name} onChange={e => setNewClient({...newClient, last_name: e.target.value})} />
              </div>
              <input required placeholder="Phone" className="border p-2 rounded w-full" value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})} />
              <input placeholder="Email" type="email" className="border p-2 rounded w-full" value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} />
              <textarea placeholder="Notes (Allergies, Preferences)" className="border p-2 rounded w-full" rows="3" value={newClient.notes} onChange={e => setNewClient({...newClient, notes: e.target.value})} />
              <div className="flex gap-2 mt-4">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">Cancel</Button>
                <Button type="submit" className="flex-1">Save Client</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
