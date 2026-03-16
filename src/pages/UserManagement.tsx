import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { Users, Shield, UserPlus, Search, MoreVertical, Check, X, Mail, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  photoURL: string | null;
  createdAt: string;
}

const ROLES = ['super_admin', 'project_manager', 'team_member', 'viewer'];

const UserManagement: React.FC = () => {
  const { profile } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New user form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('team_member');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Fetch users error:", err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, email: newEmail, role: newRole }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setUsers([data, ...users]);
        setShowAddModal(false);
        setNewName('');
        setNewEmail('');
        setNewRole('team_member');
        toast.success("User added successfully");
      } else {
        toast.error(data.error || "Failed to add user");
      }
    } catch (err) {
      console.error("Add user error:", err);
      toast.error("An error occurred while adding the user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        toast.success("User role updated");
      } else {
        toast.error("Failed to update role");
      }
    } catch (err) {
      console.error("Update role error:", err);
      toast.error("An error occurred while updating the role");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (profile?.role !== 'super_admin') {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center glass-card p-12">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-slate-900">Access Denied</h2>
          <p className="text-slate-400">Only super admins can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold shining-text">User Management</h1>
          <p className="text-slate-400 mt-2">Manage team members and their access levels.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-blue-500/50 w-full md:w-64 text-slate-900"
            />
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <UserPlus className="w-5 h-5" />
            Add User
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-4 text-sm font-medium text-slate-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-sm font-medium text-slate-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-sm font-medium text-slate-400 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-sm font-medium text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredUsers.map((user, idx) => (
                <motion.tr 
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden border border-slate-100">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <Users className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{user.name}</div>
                        <div className="text-sm text-slate-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      disabled={updatingId === user.id || user.email === profile?.email}
                      onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                      className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-blue-500/50 disabled:opacity-50 text-slate-900"
                    >
                      {ROLES.map(role => (
                        <option key={role} value={role} className="bg-white">
                          {role.replace('_', ' ').toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-900">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card w-full max-w-md p-8 z-10 relative"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold shining-text">Add New User</h2>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
              </div>
              
              <form onSubmit={handleAddUser} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      required
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-blue-500/50 transition-all text-slate-900"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      required
                      type="email"
                      value={newEmail}
                      onChange={e => setNewEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-blue-500/50 transition-all text-slate-900"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Role</label>
                  <select 
                    value={newRole}
                    onChange={e => setNewRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-all text-slate-600"
                  >
                    {ROLES.map(role => (
                      <option key={role} value={role}>{role.replace('_', ' ').toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] mt-4"
                >
                  {isSubmitting ? "Adding..." : "Add User"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagement;
