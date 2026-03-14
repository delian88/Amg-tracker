import React from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import { Search, Bell, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Layout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#020617]">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-white/60 font-medium tracking-widest uppercase text-xs animate-pulse">Initializing AMG Tracker</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex min-h-screen bg-[#020617] text-white selection:bg-blue-500/30">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 flex items-center justify-between px-8 sticky top-0 z-10 backdrop-blur-md bg-[#020617]/50 border-b border-white/5">
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-blue-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search projects, tasks, or team members..." 
                className="w-full pl-12 pr-4 py-2.5 bg-white/5 border border-white/5 rounded-xl text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all placeholder:text-white/20"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2.5 text-white/40 hover:bg-white/5 hover:text-white rounded-xl transition-all relative group">
              <Bell className="w-5 h-5" />
              <span className="absolute top-3 right-3 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#020617] group-hover:scale-110 transition-transform"></span>
            </button>
            <button className="p-2.5 text-white/40 hover:bg-white/5 hover:text-white rounded-xl transition-all">
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Layout;
