// Dashboard.jsx - KoSh Vote SMM Panel
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Routes, Route } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Wallet, TrendingUp, ShoppingCart, Clock, Zap, CheckCircle, XCircle, History, Settings, DollarSign, Lock } from 'lucide-react';

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
    if (!selectedService) { toast.error('Select a service'); return; }
    if (!link) { toast.error('Enter poll link'); return; }
    if (!quantity || quantity < 10) { toast.error('Min quantity: 10'); return; }
    setLoading(true);
    try {
      await api.post('/smm/order', { service_key: selectedService.service_key, link, quantity: parseInt(quantity) });
      toast.success('Order placed!');
      window.location.reload();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    setLoading(false);
  };

  const voteServices = services.filter(s => ['A','B','C','D','E'].includes(s.service_key));

  return (
    <div style={{padding: 20, background: '#0a0a0b', color: 'white', minHeight: '100vh'}}>
      <h1>KoSh Vote - Dashboard</h1>
      <p>Developed by Aijaz Kosh</p>
      <p>Balance: Rs {user?.balance?.toFixed(2)||'0.00'}</p>
      
      <select onChange={e => {
        const s = services.find(sv=>sv.service_key===e.target.value);
        setSelectedService(s);
      }}>
        {<option>View Services</option>}
        { services.map(s => <option key={s.service_key} value={s.service_key}>{s.service_name} - Rs {s.price}</option>)}
      </select>
      
      {selectedService && (
        <form onSubmit={handleOrder}>
          <input type="text" value={link} onChange={e=>setLink(e.target.value)} placeholder="Poll Link" />
          <input type="number" value={quantity} onChange={e=>setQuantity(e.target.value)} placeholder="Quantity" />
          <button type="submit">Place Order</button>
        </form>
      )}
      
      {orders.length > 0 && (
        <table><thead><tr><th>Bot ID</th><th>Service</th><th>Qty</th><th>Price</th><th>Status</th></tr></thead>
        {orders.map(o=><tr><td>{o.bot_order_id}</tt><td>{o.service_name}</td><td>{o.quantity}</td><td>Rs {o.price}</td><td>{o.status}</td></tr>)}
      </table> )}
    </div>
  );
}

function OrdersPage() {
  return <div><h2>Orders</h2><p>All orders here</p></div>;
}

function PaymentsPage() {
  return <div><h2>Payments</h2><p>Add payment</p></div>;
}

function SettingsPage() {
  const { user } = useAuth();
  return (
    <div>
      <h2>Settings</h2>
      <p>Name: {user?.name}</p>
      <p>Phone: {user?.phone}</p>
      <p>Balance: Rs {user?.balance?.toFixed(2)}</p>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Routes>
      <Route index element={<DashboardHome/>}/>
      <Route path="orders" element={<OrdersPage/>}/>
      <Route path="payments" element={<PaymentsPage/>}/>
      <Route path="settings" element={<SettingsPage/>}/>
    </Routes>
  );
}