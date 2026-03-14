import React, { useState, useEffect } from 'react';
import { Project, UserProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Calendar, 
  DollarSign, 
  User,
  LayoutGrid,
  List as ListIcon,
  ChevronRight,
  Zap,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Projects = () => {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [newName, setNewName] = useState('');
  const [newClient, setNewClient] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newBudget, setNewBudget] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects');
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        console.error("Fetch projects error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          client: newClient,
          deadline: new Date(newDeadline).toISOString(),
          budget: Number(newBudget),
          managerId: profile.uid,
          status: 'active',
          progress: 0,
          priority: 'medium'
        })
      });
      
      if (res.ok) {
        const newProj = await res.json();
        setProjects([newProj, ...projects]);
        setShowAddModal(false);
        setNewName('');
        setNewClient('');
        setNewDeadline('');
        setNewBudget('');
      }
    } catch (error) {
      console.error("Error adding project:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-bold shining-text">Projects</h1>
          <p className="text-white/40 mt-2">Manage and track your enterprise initiatives.</p>
        </motion.div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-white/40 hover:text-white'}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-white/40 hover:text-white'}`}
            >
              <ListIcon className="w-5 h-5" />
            </button>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input 
            type="text" 
            placeholder="Search projects..." 
            className="w-full pl-12 pr-4 py-2.5 bg-white/5 border border-white/5 rounded-xl text-sm focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-white/20"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/5 rounded-xl text-sm font-medium text-white/60 hover:bg-white/10 transition-all">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <select className="bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm font-medium text-white/60 focus:outline-none focus:border-indigo-500/50">
            <option className="bg-[#1a1a1a]">All Status</option>
            <option className="bg-[#1a1a1a]">Active</option>
            <option className="bg-[#1a1a1a]">Completed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {viewMode === 'grid' ? (
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {projects.map((project, idx) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-card p-6 group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                      <Zap className="w-6 h-6" />
                    </div>
                    <button className="text-white/20 hover:text-white transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-1 group-hover:text-indigo-300 transition-colors">{project.name}</h3>
                  <p className="text-white/40 text-sm mb-6">{project.client}</p>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/40 font-bold uppercase tracking-widest">Progress</span>
                      <span className="font-bold text-indigo-400">{project.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progress || 0}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="bg-indigo-500 h-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                      ></motion.div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                    <div className="flex items-center gap-2 text-white/40">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs font-medium">{new Date(project.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/40">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-xs font-medium">${project.budget?.toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              layout
              className="glass-card overflow-hidden"
            >
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5">
                    <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Project</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Budget</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Deadline</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {projects.map((project) => (
                    <tr key={project.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="font-bold">{project.name}</div>
                        <div className="text-xs text-white/30">{project.client}</div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                          ${project.status === 'active' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                            project.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                            'bg-white/5 text-white/40 border border-white/10'}`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm font-medium text-white/60">
                        ${project.budget?.toLocaleString()}
                      </td>
                      <td className="px-6 py-5 text-sm text-white/40">
                        {new Date(project.deadline).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-all group-hover:translate-x-1">
                          <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Add Project Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card w-full max-w-lg p-8 z-10 relative"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold shining-text">New Project</h2>
                <button onClick={() => setShowAddModal(false)} className="text-white/20 hover:text-white"><X className="w-6 h-6" /></button>
              </div>
              
              <form onSubmit={handleAddProject} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Project Name</label>
                  <input 
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500/50 transition-all"
                    placeholder="e.g. Q1 Infrastructure Upgrade"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Client Name</label>
                  <input 
                    required
                    value={newClient}
                    onChange={(e) => setNewClient(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500/50 transition-all"
                    placeholder="e.g. Global Tech Solutions"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Deadline</label>
                    <input 
                      required
                      type="date"
                      value={newDeadline}
                      onChange={(e) => setNewDeadline(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500/50 transition-all text-white/60"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Budget ($)</label>
                    <input 
                      required
                      type="number"
                      value={newBudget}
                      onChange={(e) => setNewBudget(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500/50 transition-all"
                      placeholder="50000"
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98] mt-4"
                >
                  Create Project
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Projects;
