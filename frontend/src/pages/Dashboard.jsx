import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Routes, Route } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Wallet, Clock } from 'lucide-react';

function DashboardHome() {
  const {user,api}=useAuth();
  const[sv,setSv]=useState([]);
  const[ss,setSs=]=useState(null);
  const[link,setLink=]=useState('');
  const[qt,setQt]=useState('');
  const[ld,setLd]=useState(false);
  const[ords,setOrds]=useState([]);

  useEffect(()=>{api.get('/smm/services').then(r=>setSv(r.data.services||[])).catch(()=>{});api.get('/user/orders').then(r=>setOrds((r.data||[]).slice(0,5))).catch(()=>{})},[api]);

  const hOrd=async(e)=>{e.preventDefault();if(!ss||!link||!qt||qt<10){toast.error('Fill all fields');return}setLd(true);try{await api.post('/smm/order',{service_key:ss.service_key,link,quantity:parseInt(qt)});toast.success('Order placed!');window.location.reload()}catch(er){toast.error('Failed')}setLd(false)};

  return(
    <div>
      <h1>KoSh Vote - Dashboard</h1>
      <p>Developed by Aijaz Kosh</p>
      <p>Balance: Rs {user?.balance} - Votes: {user?.total_votes||0}</p>
      
      <select onChange={e=>{const s=sv.find(s=>s.service_key===e.target.value);setSs(s)}}>
        <option>Select Service</option>
        {sv.map(s=><option value={s.service_key}>{s.service_name} - Rs {s.price}</option>)}
      </select>
      
      {ss&&(
        <form onSubmit={hOrd}>
          <input type="text" value={link} onChange={e=>setLink(e.target.value)} placeholder="Poll Link" />
          <input type="number" value={qt} onChange={e=>setQt(e.target.value)} placeholder="Quantity" />
          <button type="submit">Place Order</button>
        </form>
      )}
      
      {ords.length>0&&(
        <table>
          <thead><tr><th>Bot ID</th><th>Service</th><th>Qty</th><th>Price</th><th>Status</th></tr></thead>
          <tbody>
            {ords.map(o=><tr key={o.id}><td>{o.bot_order_id}</td><td>{o.service_name}</td><td>{o.quantity}</td><td>Rs {o.price}</td><th>{o.status}</th></tr>)}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function Dashboard() {
  return(
    <Routes>
      <Route index element={<DashboardHome/>}/>
      <Route path="orders" element={<p>All Orders</p>}/>
      <Route path="payments" element={<p>Add Payment</p>}/>
      <Route path="settings" element={<p>User Settings</p>}/>
    </Routes>
  );
}
