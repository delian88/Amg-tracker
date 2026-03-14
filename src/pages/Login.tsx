import React from 'react';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Zap, ShieldCheck, Globe, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

const Login = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;
  if (user) return <Navigate to="/" />;

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full z-10"
      >
        <div className="glass-card p-10 md:p-12 text-center">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-500/40"
          >
            <Zap className="w-10 h-10 text-white" />
          </motion.div>

          <h1 className="text-4xl font-bold mb-3 shining-text">AMG Tracker</h1>
          <p className="text-white/40 text-sm font-medium uppercase tracking-[0.2em] mb-10">Azariah Management Group</p>

          <div className="space-y-6">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-4 bg-white text-black font-bold py-4 px-6 rounded-2xl hover:bg-indigo-50 transition-all active:scale-[0.98] shadow-xl shadow-white/5 group"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              Continue with Google
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </button>
            
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

            <p className="text-white/20 text-[10px] leading-relaxed pt-6 border-t border-white/5">
              Enterprise access portal. Authorized personnel only.
              <br />
              © 2026 Azariah Management Group
            </p>
          </div>
        </div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-10 text-xs text-white/20"
        >
          Need assistance? <a href="#" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">Contact IT Support</a>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;
