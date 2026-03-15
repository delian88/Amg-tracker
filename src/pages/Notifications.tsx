import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Notification } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Bell, Check, Trash2, Clock, AlertCircle, UserPlus, Zap } from 'lucide-react';
import { format } from 'date-fns';

const Notifications = () => {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchNotifications();
    }
  }, [profile]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`/api/notifications?userId=${profile?.uid}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      if (res.ok) {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'task_assignment': return <UserPlus className="w-4 h-4 text-blue-500" />;
      case 'deadline_approaching': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'overdue': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'status_change': return <Zap className="w-4 h-4 text-emerald-500" />;
      default: return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold shining-text">Notifications</h1>
        <p className="text-slate-400 mt-2">Stay updated with your latest task assignments and project alerts.</p>
      </motion.div>

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Recent Alerts</h3>
          <button 
            onClick={() => notifications.forEach(n => !n.read && markAsRead(n.id))}
            className="text-xs font-bold text-blue-600 hover:text-blue-500 transition-colors uppercase tracking-widest"
          >
            Mark all as read
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : notifications.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {notifications.map((notification, idx) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-6 flex gap-4 items-start hover:bg-slate-50 transition-colors ${!notification.read ? 'bg-blue-50/30' : ''}`}
                >
                  <div className={`p-3 rounded-xl border ${!notification.read ? 'bg-white border-blue-100' : 'bg-slate-50 border-slate-100'}`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${!notification.read ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      {format(new Date(notification.createdAt), 'MMM dd, h:mm a')}
                    </p>
                  </div>
                  {!notification.read && (
                    <button 
                      onClick={() => markAsRead(notification.id)}
                      className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-all"
                      title="Mark as read"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="p-12 text-center">
              <Bell className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 italic">No notifications yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
