import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LogOut, User, Shield, ChevronDown, Menu, X, Vote } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <nav className="bg-[#0d0d14] border-b border-gray-800/60 sticky top-0 z-50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-2.5 group">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-2 rounded-lg shadow-lg shadow-purple-600/30 group-hover:shadow-purple-600/50 transition-all">
              <Vote className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">KoSh Vote</span>
          </Link>
          <button className="lg:hidden p-2 text-gray-400 hover:text-white" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="hidden lg:flex items-center gap-4">
            {isAdmin ? (
              <Link to="/admin" className={`px-3 py-2 rounded-lg text-sm font-medium ${location.pathname === '/admin' ? 'bg-purple-600/20 text-purple-400' : 'text-gray-400 hover:text-white'}`}><Shield size={16} className="inline mr-1.5" />Admin</Link>
            ) : (
              <>
                <Link to="/dashboard" className={`px-3 py-2 rounded-lg text-sm font-medium ${location.pathname === '/dashboard' ? 'bg-purple-600/20 text-purple-400' : 'text-gray-400 hover:text-white'}`}>Dashboard</Link>
                <Link to="/dashboard/orders" className={`px-3 py-2 rounded-lg text-sm font-medium ${location.pathname === '/dashboard/orders' ? 'bg-purple-600/20 text-purple-400' : 'text-gray-400 hover:text-white'}`}>My Orders</Link>
                <Link to="/dashboard/payments" className={`px-3 py-2 rounded-lg text-sm font-medium ${location.pathname === '/dashboard/payments' ? 'bg-purple-600/20 text-purple-400' : 'text-gray-400 hover:text-white'}`}>Payments</Link>
                <Link to="/dashboard/settings" className={`px-3 py-2 rounded-lg text-sm font-medium ${location.pathname === '/dashboard/settings' ? 'bg-purple-600/20 text-purple-400' : 'text-gray-400 hover:text-white'}`}>Settings</Link>
              </>
            )}

            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/10">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">{(user?.name || 'U')[0].toUpperCase()}</div>
                <span className="text-sm text-gray-300">{user?.name}</span>
                <ChevronDown size={14} className="text-gray-500" />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#12121a] border border-gray-800 rounded-xl shadow-2xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-800">
                    <p className="text-sm text-white font-medium">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <button onClick={() => { navigate('/dashboard/settings'); setDropdownOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5">
                    <User size={16} />Settings
                  </button>
                  <button onClick={() => { handleLogout(); setDropdownOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10">
                    <LogOut size={16} />Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {menuOpen && (
          <div className="lg:hidden border-t border-gray-800 py-4 space-y-1">
            {isAdmin ? (
              <Link to="/admin" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-gray-400 hover:text-white rounded-lg">Admin Panel</Link>
            ) : (
              <>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-gray-400 hover:text-white rounded-lg">Dashboard</Link>
                <Link to="/dashboard/orders" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-gray-400 hover:text-white rounded-lg">Orders</Link>
                <Link to="/dashboard/payments" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-gray-400 hover:text-white rounded-lg">Payments</Link>
                <Link to="/dashboard/settings" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-gray-400 hover:text-white rounded-lg">Settings</Link>
              </>
            )}
            <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-red-400 hover:text-red-300 rounded-lg">Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
}
