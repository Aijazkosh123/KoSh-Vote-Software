import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Routes, Route } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Wallet, Clock } from 'lucide-react';

function DashboardHome() {
  const { user, api } = useAuth();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get('/smm/services').then(r => setServices(r.data.services || [])).catch(() => {});
    api.get('/user/orders').then(r => setOrders((r.data || []).slice(0, 5))).catch(() => {});
  }, [api]);

  const handleOrder = async (e) => {
    e.preventDefault();
    if (!selectedService || !link || !quantity || quantity < 10) {
      toast.error('Fill all fields (Min Qty: 10)');
      return;
    }
    setLoading(true);
    try {
      await api.post('/smm/order', {
        service_key: selectedService.service_key,
        link,
        quantity: parseInt(quantity)
      });
      toast.success('Order placed!');
      window.location.reload();
    } catch (err) {
      toast.error('Failed');
    }
    setLoading(false);
  };

  return (
    <div className="p-4 text-white">
      <h1>KoSh Vote - Dashboard</h1>
      <p className="text-gray-500">Developed by Aijaz Kosh</p>
      <p>Balance: Rs {user?.balance} - Votes: {user?.total_votes || 0}</p>
      
      <select onChange={e => {
        const s = services.find(sv => sv.service_key === e.target.value);
        setSelectedService(s);
      }} className="bg-gray-800 text-white p-2 rounded my-2">
        <option value="">Select Service</option>
        {services.map(s => <option key={s.service_key} value={s.service_key}>{s.service_name} - Rs {s.price}</option>)}
      </select>
      
      {selectedService && (
        <form onSubmit={handleOrder} className="space-y-2">
          <input type="text" value={link} onChange={e => setLink(e.target.value)} placeholder="Poll Link" className="bg-gray-800 text-white p-2 rounded block" />
          <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="Quantity" className="bg-gray-800 text-white p-2 rounded block" />
          <button type="submit" className="bg-purple-600 px-4 py-2 rounded">Place Order</button>
        </form>
      )}
      
      {orders.length > 0 && (
        <table className="mt-4 w-full">
          <thead><tr><th>Bot ID</th><th>Service</th><th>Qty</th><th>Price</th><th>Status</th></tr></thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td>{o.bot_order_id}</td>
                <td>{o.service_name}</td>
                <td>{o.quantity}</td>
                <td>Rs {o.price}</td>
                <td>{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function Dashboard() {
  return (
    <Routes>
      <Route index element={<DashboardHome />} />
      <Route path="orders" element={<p className="p-4 text-white">All Orders</p>} />
      <Route path="payments" element={<p className="p-4 text-white">Add Payment</p>} />
      <Route path="settings" element={<p className="p-4 text-white">User Settings</p>} />
    </Routes>
  );
                                                 }
