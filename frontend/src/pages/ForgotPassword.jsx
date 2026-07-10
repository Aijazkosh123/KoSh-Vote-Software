import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Vote, Mail, Lock, Key, Send, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendToken = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      setToken(res.data.resetToken || '');
      toast.success('Reset token generated!');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/auth/reset-password', { email, token, newPassword });
      toast.success('Password reset! Login now.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px]" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-600 p-3 rounded-2xl shadow-xl shadow-purple-600/30 mb-4">
            <Vote className="w-10 h-10 text-white" />
          </div>
        </div>
        <div className="bg-[#0d0d14] border border-gray-800/60 rounded-2xl p-8 shadow-2xl">
          {step === 1 && (
            <form onSubmit={handleSendToken} className="space-y-4">
              <h2 className="text-xl font-semibold text-white mb-2">Forgot Password</h2>
              <p className="text-gray-500 text-sm mb-4">Enter your email to receive a reset token.</p>
              <div>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className="w-full bg-[#12121a] border border-gray-700/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 disabled:opacity-50 text-white py-3 rounded-xl">{<Send size={18} />} Send Reset Token</button>
              <button type="button" onClick={() => navigate('/login')} className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-white py-2 text-sm"><ArrowLeft size={16} /> Back to Login</button>
            </form>
          )}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <h2 className="text-xl font-semibold text-white mb-2">Reset Password</h2>
              <p className="text-gray-500 text-sm mb-4">Enter the token from email and your new password.</p>
              <div>
                <div className="relative">
                  <Key size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input type="text" value={token} onChange={e => setToken(e.target.value)} placeholder="Reset token" required className="w-full bg-[#12121a] border border-gray-700/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 font-mono text-xs" />
                </div>
              </div>
              <div>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password (min 6 chars)" required className="w-full bg-[#12121a] border border-gray-700/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 disabled:opacity-50 text-white py-3 rounded-xl">{loading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white" /> : <Lock size={18} />} Reset Password</button>
              <button type="button" onClick={() => setStep(1)} className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-white py-2 text-sm"><ArrowLeft size={16} /> Back</button>
            </form>
          )}
          
        </div>
      </div>
    </div>
  );
}
