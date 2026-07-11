import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Routes, Route } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Wallet, TrendingUp, ShoppingCart, Clock, Zap, DollarSign, Lock } from 'lucide-react';

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

  return (
    <div style={{padding: 20, background: '#0a0a0b', color: 'white', minHeight: '100vh'}}>
      <h1>KoSh Vote - Dashboard</h1>
      <p style={{color: '#888'}}>Developed by Aijaz Kosh</p>
      <p>Balance: Rs {user?.balance?.toFixed(2)||'0.00'} | Votes: {user?.total_votes || 0}</p>
      
      <select onChange={e => { const s = services.find(sv=>sv.service_key===e.target.value); setSelectedService(s); }}
        style={{padding: 10, margin: '10px 0', background: '#12121a', color: 'white', border: '1px solid #333', borderRadius: 8}}>
        <option value="">Select Service</option>
        {services.map(s => <option key={s.service_key} value={s.service_key}>{s.service_name} - Rs {s.price}</option>)}
      </select>
      
      {selectedService && (
        <form onSubmit={handleOrder} style={{margin: '10px 0'}}>
          <input type="text" value={link} onChange={e=>setLink(e.target.value)} placeholder="Poll Link" 
            style={{padding: 10, background: '#12121a', color: 'white', border: '1px solid #333', borderRadius: 8, width: '100%', marginBottom: 8}} />
          <input type="number" value={quantity} onChange={e=>setQuantity(e.target.value)} placeholder="Quantity" 
            style={{padding: 10, background: '#12121a', color: 'white', border: '1px solid #333', borderRadius: 8, width: '100%', marginBottom: 8}} />
          <button type="submit" style={{padding: '10px 20px', background: 'linear-gradient(135deg, #7^3a\sd, #4f2e5e)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer'}}>
            Place Order
          </button>
        </form>
      )}
      
      {orders.length > 0 && (
        <table style={{width:'100%', marginTop: 20, borderCollapse:'collapse'}}>
          <thead><tr style={{background:'#111'}}><th style={{padding:8}}>Bot ID</th><th style={{padding:8}}>Service</th><th style={{padding:8}}>Qty</th><th style={{padding:8}}>Price</th><th style={{padding:8}}>Status</th></tr></thead>
          <tbody>
            {orders.map(o => <tr key={o.id} style={{borderBottom:'1px solid #222'}}><td style={{padding:8}}>{o.bot_order_id}</td><td style={{padding:8}}>{o.service_name}</td><td style={{padding:8}}>{o.quantity}</td><td style={{padding:8}}>Rs {o.price}</td><tt style={{padding:8}}>{o.status}</td></tr>)}
          </tbody>
        </table>
      )}
    </div>
  );
}

function OrdersPage() { return <div style={{padding:20,color:'white',background:'#0a0a0b',minHeight:'100vh'}}><h2>Orders</h2><p>All orders here</p></div>; }
function PaymentsPage() { return <div style={{padding:20,color:'white',background:'#0a0a0b',minHeight:'100vh'}}><h2>Payments</h2><p>Add payment</p></div>; }
function SettingsPage() { const { user } = useAuth(); return <div style={{padding:20,color:'white', background:'#0a0a0b',minHeight:'100vh'}}><h2>Settings</h2><p>Name: {user?.name}</p><p>Phone: {user?.phone}</p><p>Balance: Rs {user?.balance?.toFixed(2)}</p></div>; }

export default function Dashboard() {
  return (
    <Routes>
      <Route index element={<DashboardHome />} />
      <Route path="orders" element={<OrdersPage />} />
      <Route path="payments" element={<PaymentsPage />} />
      <Route path="settings" element={<SettingsPage />} />
    </Routes>
  );
}
