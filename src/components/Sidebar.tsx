import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  CheckSquare, 
  Calendar, 
  Bell, 
  Settings, 
  LogOut,
  Users,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Sidebar = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Briefcase, label: 'Projects', path: '/projects' },
    { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
  ];

  if (profile?.role === 'super_admin') {
    navItems.push({ icon: Users, label: 'Team', path: '/team' });
    navItems.push({ icon: Settings, label: 'Settings', path: '/settings' });
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
            A
          </div>
          <div>
            <h1 className="font-bold text-slate-900 leading-none">AMG Tracker</h1>
            <p className="text-xs text-slate-500 mt-1">Azariah Management</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-indigo-50 text-indigo-700" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
            {profile?.photoURL ? (
              <img src={profile.photoURL} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-slate-600 font-medium">{profile?.name?.charAt(0)}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{profile?.name}</p>
            <p className="text-xs text-slate-500 truncate capitalize">{profile?.role?.replace('_', ' ')}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
