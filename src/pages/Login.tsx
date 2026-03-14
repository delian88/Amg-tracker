import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Zap, ShieldCheck, Globe, ArrowRight, Mail, Lock } from 'lucide-react';
import { motion } from 'motion/react';

const Login = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isEmailLogin, setIsEmailLogin] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/" />;

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (error) {
      console.error("Login failed:", error);
      setError("Google login failed. Please try again.");
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (error: any) {
      console.error("Email login failed:", error);
      setError(error.message || "Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#020617]">
      {/* Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full z-10"
      >
        <div className="glass-card p-10 md:p-12 text-center">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/40"
          >
            <Zap className="w-8 h-8 text-white" />
          </motion.div>

          <h1 className="text-3xl font-bold mb-2 shining-text">AMG Tracker</h1>
          <p className="text-white/40 text-[10px] font-medium uppercase tracking-[0.2em] mb-8">Azariah Management Group</p>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-left">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {!isEmailLogin ? (
              <>
                <button
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-4 bg-white text-black font-bold py-4 px-6 rounded-2xl hover:bg-blue-50 transition-all active:scale-[0.98] shadow-xl shadow-white/5 group"
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                  Continue with Google
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </button>
                
                <button
                  onClick={() => setIsEmailLogin(true)}
                  className="w-full flex items-center justify-center gap-4 bg-white/5 text-white font-bold py-4 px-6 rounded-2xl hover:bg-white/10 transition-all active:scale-[0.98] border border-white/10"
                >
                  <Mail className="w-5 h-5" />
                  Sign in with Email
                </button>
              </>
            ) : (
              <form onSubmit={handleEmailLogin} className="space-y-4 text-left">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="info@azariahmg.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
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

                <button
                  type="button"
                  onClick={() => setIsEmailLogin(false)}
                  className="w-full text-white/40 text-xs font-medium py-2 hover:text-white transition-colors"
                >
                  Back to other options
                </button>
              </form>
            )}
            
            <div className="flex items-center justify-center gap-6 pt-4">
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <ShieldCheck className="w-5 h-5 text-white/40" />
                </div>
                <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Secure</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <Globe className="w-5 h-5 text-white/40" />
                </div>
                <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Global</span>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5">
              <p className="text-white/20 text-[10px] leading-relaxed mb-4">
                Enterprise access portal. Authorized personnel only.
              </p>
              <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 text-left">
                <p className="text-[9px] text-blue-400 font-bold uppercase tracking-wider mb-1">Super Admin Login:</p>
                <p className="text-[10px] text-white/40">Email: <span className="text-white/60">info@azariahmg.com</span></p>
                <p className="text-[10px] text-white/40">Pass: <span className="text-white/60">Admin@webmaster$123</span></p>
              </div>
            </div>
          </div>
        </div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-10 text-xs text-white/20"
        >
          Need assistance? <a href="#" className="text-blue-400 font-bold hover:text-blue-300 transition-colors">Contact IT Support</a>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;
