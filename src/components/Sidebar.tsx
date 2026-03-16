import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  CheckSquare, 
  Bell, 
  LogOut,
  BarChart3,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { toast } from 'sonner';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Sidebar = () => {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    if (profile) {
      const fetchNotifications = async () => {
        try {
          const res = await fetch(`/api/notifications?userId=${profile.uid}`);
          if (res.ok) {
            const data = await res.json();
            setUnreadCount(data.filter((n: any) => !n.read).length);
          }
        } catch (err) {
          console.error("Failed to fetch notifications:", err);
        }
      };

      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [profile]);

  const handleLogout = () => {
    logout();
    toast.success("Signed out successfully");
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Briefcase, label: 'Projects', path: '/projects' },
    { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Bell, label: 'Notifications', path: '/notifications', badge: unreadCount > 0 ? unreadCount : undefined },
  ];

  if (profile?.role === 'super_admin') {
    navItems.push({ icon: ShieldCheck, label: 'Management', path: '/management' });
  }

  return (
    <aside className="w-64 bg-white lg:bg-transparent flex flex-col h-full lg:h-[calc(100vh-2rem)] lg:m-4 lg:mr-0 shadow-lg lg:shadow-none rounded-none lg:rounded-xl">

      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>

          <div>
            <h1 className="font-bold text-slate-900 text-lg">AMG Tracker</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">
              Azariah Management
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                )
              }
            >
              <item.icon className="w-5 h-5 opacity-80" />

              {item.label}

              {item.badge && (
                <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Profile Section */}
      <div className="mt-auto p-6 border-t border-slate-100">

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center overflow-hidden">
            {profile?.photoURL ? (
              <img
                src={profile.photoURL}
                alt={profile.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-blue-600 font-medium">
                {profile?.name?.charAt(0)}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {profile?.name}
            </p>
            <p className="text-[10px] text-emerald-600 uppercase font-bold">
              {profile?.role?.replace('_', ' ')}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;