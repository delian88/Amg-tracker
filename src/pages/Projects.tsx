import React, { useState, useEffect } from 'react';
import { Project, Task } from '../types';
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
  X,
  Briefcase,
  TrendingUp,
  Trash2,
  BarChart3,
  Users,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const Projects = () => {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Form state
  const [newName, setNewName] = useState('');
  const [newClient, setNewClient] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/tasks')
      ]);
      const [projectsData, tasksData] = await Promise.all([
        projectsRes.json(),
        tasksRes.json()
      ]);
      
      if (Array.isArray(projectsData)) {
        setProjects(projectsData);
      } else {
        console.error("Projects data is not an array:", projectsData);
        setProjects([]);
      }

      if (Array.isArray(tasksData)) {
        setTasks(tasksData);
      } else {
        console.error("Tasks data is not an array:", tasksData);
        setTasks([]);
      }
    } catch (err) {
      console.error("Fetch projects error:", err);
      toast.error("Failed to load projects");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSubmitting(true);

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
      
      const data = await res.json();
      
      if (res.ok) {
        setProjects([data, ...projects]);
        setShowAddModal(false);
        setNewName('');
        setNewClient('');
        setNewDeadline('');
        setNewBudget('');
        toast.success("Project created successfully");
      } else {
        toast.error(data.error || "Failed to create project");
      }
    } catch (error) {
      console.error("Error adding project:", error);
      toast.error("An error occurred while creating the project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (projectId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const updatedProj = await res.json();
        setProjects(projects.map(p => p.id === projectId ? updatedProj : p));
        if (selectedProject?.id === projectId) {
          setSelectedProject(updatedProj);
        }
        toast.success(`Project status updated to ${newStatus}`);
      } else {
        toast.error("Failed to update project status");
      }
    } catch (err) {
      console.error("Failed to update project status:", err);
      toast.error("An error occurred while updating status");
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? All associated tasks will also be deleted.')) return;
    
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects(projects.filter(p => p.id !== projectId));
        if (selectedProject?.id === projectId) {
          setSelectedProject(null);
        }
        toast.success("Project deleted successfully");
      } else {
        toast.error("Failed to delete project");
      }
    } catch (err) {
      console.error("Failed to delete project:", err);
      toast.error("An error occurred while deleting the project");
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.client?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getProjectTasks = (projectId: string) => {
    return tasks.filter(t => t.projectId === projectId);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-bold shining-text">Projects</h1>
          <p className="text-slate-400 mt-2">Manage and track your enterprise initiatives.</p>
        </motion.div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <ListIcon className="w-5 h-5" />
            </button>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          <input 
            type="text" 
            placeholder="Search projects..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-300"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 focus:outline-none focus:border-blue-500/50"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
            <option value="delayed">Delayed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {viewMode === 'grid' ? (
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredProjects.map((project, idx) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-card p-6 group cursor-pointer"
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 group-hover:scale-110 transition-transform">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <select 
                        value={project.status}
                        onChange={(e) => handleUpdateStatus(project.id, e.target.value)}
                        className="bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 focus:outline-none focus:border-blue-500/50"
                      >
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="archived">Archived</option>
                        <option value="delayed">Delayed</option>
                      </select>
                      <button 
                        onClick={() => handleDeleteProject(project.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-all text-slate-300 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-1 text-slate-900 group-hover:text-blue-600 transition-colors">{project.name}</h3>
                  <p className="text-slate-400 text-sm mb-6">{project.client}</p>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-bold uppercase tracking-widest">Progress</span>
                      <span className="font-bold text-blue-600">{project.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progress || 0}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="bg-blue-600 h-full"
                      ></motion.div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs font-medium">{format(new Date(project.deadline), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
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
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Project</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Budget</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deadline</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProjects.map((project) => (
                    <tr 
                      key={project.id} 
                      className="hover:bg-slate-50 transition-colors group cursor-pointer"
                      onClick={() => setSelectedProject(project)}
                    >
                      <td className="px-6 py-5">
                        <div className="font-bold text-slate-900">{project.name}</div>
                        <div className="text-xs text-slate-400">{project.client}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div onClick={(e) => e.stopPropagation()}>
                          <select 
                            value={project.status}
                            onChange={(e) => handleUpdateStatus(project.id, e.target.value)}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-blue-500/50 cursor-pointer
                              ${project.status === 'active' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 
                                project.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                                'bg-slate-50 text-slate-400 border border-slate-100'}`}
                          >
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="archived">Archived</option>
                            <option value="delayed">Delayed</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm font-medium text-slate-600">
                        ${project.budget?.toLocaleString()}
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-500">
                        {format(new Date(project.deadline), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => handleDeleteProject(project.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-all text-slate-300 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-blue-50 rounded-lg transition-all group-hover:translate-x-1">
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600" />
                          </button>
                        </div>
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
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card w-full max-w-lg p-8 z-10 relative"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold shining-text">New Project</h2>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
              </div>
              
              <form onSubmit={handleAddProject} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Project Name</label>
                  <input 
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-all text-slate-900"
                    placeholder="e.g. Q1 Infrastructure Upgrade"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Client Name</label>
                  <input 
                    required
                    value={newClient}
                    onChange={(e) => setNewClient(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-all text-slate-900"
                    placeholder="e.g. Global Tech Solutions"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Deadline</label>
                    <input 
                      required
                      type="date"
                      value={newDeadline}
                      onChange={(e) => setNewDeadline(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-all text-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Budget ($)</label>
                    <input 
                      required
                      type="number"
                      value={newBudget}
                      onChange={(e) => setNewBudget(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-all text-slate-900"
                      placeholder="50000"
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] mt-4"
                >
                  {isSubmitting ? "Creating..." : "Create Project"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Project Details Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              className="glass-card w-full max-w-4xl h-[85vh] flex flex-col z-10 relative"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{selectedProject.name}</h2>
                    <p className="text-sm text-slate-400">{selectedProject.client}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <select 
                    value={selectedProject.status}
                    onChange={(e) => handleUpdateStatus(selectedProject.id, e.target.value)}
                    className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border bg-white cursor-pointer
                      ${selectedProject.status === 'active' ? 'text-blue-600 border-blue-100' : 
                        selectedProject.status === 'completed' ? 'text-emerald-600 border-emerald-100' : 
                        'text-slate-400 border-slate-100'}`}
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                    <option value="delayed">Delayed</option>
                  </select>
                  <button onClick={() => setSelectedProject(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"><X className="w-6 h-6" /></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-3 gap-6">
                      <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Budget</p>
                        <p className="text-xl font-bold text-blue-700">${selectedProject.budget?.toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Progress</p>
                        <p className="text-xl font-bold text-emerald-700">{selectedProject.progress || 0}%</p>
                      </div>
                      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                        <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Tasks</p>
                        <p className="text-xl font-bold text-amber-700">{getProjectTasks(selectedProject.id).length}</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-blue-500" />
                          Project Tasks
                        </h3>
                        <button className="text-blue-600 text-xs font-bold uppercase tracking-widest hover:text-blue-500">Add Task</button>
                      </div>
                      <div className="space-y-3">
                        {getProjectTasks(selectedProject.id).length > 0 ? getProjectTasks(selectedProject.id).map(task => (
                          <div key={task.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-blue-200 transition-all group">
                            <div className="flex items-center gap-4">
                              <div className={`w-2 h-2 rounded-full ${task.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                              <div>
                                <p className={`text-sm font-semibold text-slate-700 ${task.status === 'completed' ? 'line-through text-slate-400' : ''}`}>{task.title}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{task.priority}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{format(new Date(task.dueDate), 'MMM dd')}</span>
                              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                            </div>
                          </div>
                        )) : (
                          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <p className="text-sm text-slate-400">No tasks found for this project.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 bg-slate-900 rounded-2xl text-white space-y-6">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                        Project Health
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                            <span>Timeline</span>
                            <span className="text-emerald-400">On Track</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-emerald-400 h-full w-[85%]"></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                            <span>Budget</span>
                            <span className="text-blue-400">72% Used</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-blue-400 h-full w-[72%]"></div>
                          </div>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-white/10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-slate-300" />
                          </div>
                          <div>
                            <p className="text-xs font-bold">Team Members</p>
                            <p className="text-[10px] text-slate-400">4 active members</p>
                          </div>
                        </div>
                        <div className="flex -space-x-2">
                          {[1,2,3,4].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                              {String.fromCharCode(64 + i)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button className="w-full py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                      <ArrowUpRight className="w-4 h-4" />
                      Export Report
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Projects;
