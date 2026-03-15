import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Zap, ShieldCheck, Globe, Mail, Lock } from 'lucide-react';
import { motion } from 'motion/react';

const Login = () => {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (loading) return null;
  if (user) return <Navigate to="/" />;

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (error: any) {
      setError(error.message || "Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-white">
      {/* Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/5 blur-[120px] rounded-full"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full z-10"
      >
        <div className="glass-card p-10 md:p-12 text-center border-4 border-black shadow-2xl shadow-slate-200/50">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/20"
          >
            <Zap className="w-8 h-8 text-white" />
          </motion.div>

          <h1 className="text-3xl font-bold mb-2 shining-text">AMG Tracker</h1>
          <p className="text-slate-400 text-[10px] font-medium uppercase tracking-[0.2em] mb-8">Azariah Management Group</p>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs text-left">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <form onSubmit={handleEmailLogin} className="space-y-4 text-left">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-slate-50 border-2 border-blue-500/10 rounded-xl py-3 pl-12 pr-4 text-slate-900 focus:outline-none focus:border-blue-500/30 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border-2 border-blue-500/10 rounded-xl py-3 pl-12 pr-4 text-slate-900 focus:outline-none focus:border-blue-500/30 transition-colors"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-2xl hover:bg-blue-500 transition-all active:scale-[0.98] shadow-xl shadow-blue-500/20"
              >
                Sign In
              </button>
            </form>
            
            <div className="flex items-center justify-center gap-6 pt-4">
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                  <ShieldCheck className="w-5 h-5 text-slate-400" />
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Secure</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                  <Globe className="w-5 h-5 text-slate-400" />
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global</span>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <p className="text-slate-400 text-[10px] leading-relaxed">
                Enterprise access portal. Authorized personnel only.
              </p>
            </div>
          </div>
        </div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-10 text-xs text-slate-400"
        >
          Need assistance? <a href="#" className="text-blue-600 font-bold hover:text-blue-500 transition-colors">Contact IT Support</a>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;
