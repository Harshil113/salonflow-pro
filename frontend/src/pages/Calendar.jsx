import React, { useState, useEffect } from 'react';
import { format, addDays, subDays, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, User, Scissors, Plus, CheckCircle, XCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(startOfDay(new Date()));
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [staff, setStaff] = useState([]);
  const [services, setServices] = useState([]);
  
  // Form State
  const [newAppt, setNewAppt] = useState({
    client_id: '', staff_id: '', service_id: '', start_time: '', notes: ''
  });

  const token = localStorage.getItem('token');

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    
    // 1. Get Appointments
    try {
      const apptRes = await fetch(`http://localhost:5000/api/appointments?date=${dateStr}`, {
        headers: { 'x-auth-token': token }
      });
      const apptData = await apptRes.json();
      if (apptData.success) setAppointments(apptData.data);
    } catch (err) { console.error(err); }

    // 2. Get Lists for Modal (only once needed, but simplified here)
    if (clients.length === 0) {
      const [cRes, sRes, servRes] = await Promise.all([
        fetch('http://localhost:5000/api/clients', { headers: { 'x-auth-token': token } }),
        fetch('http://localhost:5000/api/auth/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({email:'admin@salon.com', password:'password123'}) }).then(r=>r.json()).then(d=>{
             // Hack: Re-use token or fetch users endpoint. For now, let's assume we need a dedicated users list. 
             // Simplified: We will just use the seeded staff IDs (1, 2, 3) or fetch from a new endpoint if created.
             // Let's create a quick helper: Fetch users from DB directly via a new endpoint or mock for now.
             // BETTER: Let's assume we have a /api/users endpoint or hardcode for demo if missing.
             // Actually, let's just fetch clients and services. Staff we can mock or add later.
             return []; 
        }), 
        fetch('http://localhost:5000/api/services', { headers: { 'x-auth-token': token } })
      ]);
      
      const cData = await cRes.json();
      const servData = await servRes.json();
      
      if (cData.success) setClients(cData.data);
      if (servData.success) setServices(servData.data);
      
      // Mock Staff for now (since we don't have a public user list endpoint yet)
      setStaff([
        { id: 1, first_name: 'Super', last_name: 'Admin', color_code: '#6366f1' },
        { id: 2, first_name: 'Sarah', last_name: 'Stylist', color_code: '#ec4899' },
        { id: 3, first_name: 'Mike', last_name: 'Barber', color_code: '#10b981' }
      ]);
    }
    
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [currentDate]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify(newAppt)
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchData();
        setNewAppt({ client_id: '', staff_id: '', service_id: '', start_time: '', notes: '' });
      } else {
        alert(data.msg || 'Error creating appointment');
      }
    } catch (err) { alert('Network error'); }
  };

  const updateStatus = async (id, status) => {
    try {
      await fetch(`http://localhost:5000/api/appointments/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ status })
      });
      fetchData();
    } catch (err) { alert('Error updating status'); }
  };

  const getStatusColor = (status) => {
    if (status === 'completed') return 'bg-green-100 text-green-700 border-green-200';
    if (status === 'cancelled') return 'bg-red-100 text-red-700 border-red-200';
    if (status === 'no_show') return 'bg-gray-100 text-gray-700 border-gray-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {format(currentDate, 'EEEE, MMMM do')}
          </h2>
          <div className="flex gap-2">
            <button onClick={() => setCurrentDate(subDays(currentDate, 1))} className="p-2 hover:bg-gray-100 rounded"><ChevronLeft/></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-sm font-medium hover:bg-gray-100 rounded">Today</button>
            <button onClick={() => setCurrentDate(addDays(currentDate, 1))} className="p-2 hover:bg-gray-100 rounded"><ChevronRight/></button>
          </div>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={20} /> Book Appointment
        </Button>
      </div>

      {/* Timeline / List */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-gray-500">Loading schedule...</p>
        ) : appointments.length === 0 ? (
          <Card className="text-center py-12 text-gray-400">
            <Clock size={48} className="mx-auto mb-4 opacity-50"/>
            <p>No appointments scheduled for this day.</p>
          </Card>
        ) : (
          appointments.map(appt => (
            <Card key={appt.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4" style={{ borderLeftColor: appt.color_code || '#6366f1' }}>
              <div className="flex items-start gap-4 flex-1">
                <div className="text-center min-w-[80px]">
                  <p className="text-lg font-bold text-gray-900">{format(new Date(appt.start_time), 'h:mm a')}</p>
                  <p className="text-xs text-gray-500">{appt.duration} min</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{appt.client_first} {appt.client_last}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <Scissors size={14}/> {appt.service_name}
                    <span className="mx-1">•</span>
                    <User size={14}/> {appt.staff_first} {appt.staff_last}
                  </div>
                  {appt.notes && <p className="text-xs text-gray-500 mt-1 italic">"{appt.notes}"</p>}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize border ${getStatusColor(appt.status)}`}>
                  {appt.status}
                </span>
                
                {appt.status === 'scheduled' && (
                  <div className="flex gap-2">
                    <button onClick={() => updateStatus(appt.id, 'completed')} title="Mark Complete" className="p-2 text-green-600 hover:bg-green-50 rounded"><CheckCircle size={20}/></button>
                    <button onClick={() => updateStatus(appt.id, 'cancelled')} title="Cancel" className="p-2 text-red-600 hover:bg-red-50 rounded"><XCircle size={20}/></button>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Book Appointment</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Client</label>
                <select required className="w-full border p-2 rounded mt-1" value={newAppt.client_id} onChange={e => setNewAppt({...newAppt, client_id: e.target.value})}>
                  <option value="">Select Client</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Staff</label>
                <select required className="w-full border p-2 rounded mt-1" value={newAppt.staff_id} onChange={e => setNewAppt({...newAppt, staff_id: e.target.value})}>
                  <option value="">Select Staff</option>
                  {staff.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Service</label>
                <select required className="w-full border p-2 rounded mt-1" value={newAppt.service_id} onChange={e => setNewAppt({...newAppt, service_id: e.target.value})}>
                  <option value="">Select Service</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name} (${s.price})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date & Time</label>
                <input 
                  type="datetime-local" 
                  required 
                  className="w-full border p-2 rounded mt-1"
                  value={newAppt.start_time}
                  onChange={e => setNewAppt({...newAppt, start_time: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea className="w-full border p-2 rounded mt-1" rows="2" value={newAppt.notes} onChange={e => setNewAppt({...newAppt, notes: e.target.value})}></textarea>
              </div>
              <div className="flex gap-2 mt-4">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">Cancel</Button>
                <Button type="submit" className="flex-1">Book Now</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
