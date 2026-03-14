import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, Project, UserProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MoreVertical,
  Calendar as CalendarIcon,
  User as UserIcon,
  Tag,
  X,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';

const Tasks = () => {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newProjectId, setNewProjectId] = useState('');
  const [newAssignedTo, setNewAssignedTo] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState('medium');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, projectsRes, usersRes] = await Promise.all([
          fetch('/api/tasks'),
          fetch('/api/projects'),
          fetch('/api/users')
        ]);
        
        const [tasksData, projectsData, usersData] = await Promise.all([
          tasksRes.json(),
          projectsRes.json(),
          usersRes.json()
        ]);

        setTasks(tasksData);
        setProjects(projectsData);
        setUsers(usersData);
      } catch (err) {
        console.error("Fetch tasks data error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          projectId: newProjectId,
          assignedTo: newAssignedTo,
          dueDate: new Date(newDueDate).toISOString(),
          priority: newPriority,
          status: 'pending',
          progress: 0
        })
      });

      if (res.ok) {
        const newTask = await res.json();
        setTasks([newTask, ...tasks]);
        setShowAddModal(false);
        setNewTitle('');
        setNewProjectId('');
        setNewAssignedTo('');
        setNewDueDate('');
      }
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'overdue': return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-400" />;
      default: return <Clock className="w-4 h-4 text-white/20" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'high': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'medium': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-white/5 text-white/40 border-white/10';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-bold shining-text">Tasks</h1>
          <p className="text-white/40 mt-2">Track individual deliverables and team assignments.</p>
        </motion.div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Add Task
        </button>
      </div>

      {/* Task List */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-white/5 flex flex-col md:flex-row gap-4 bg-white/5">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              className="w-full pl-12 pr-4 py-2.5 bg-white/5 border border-white/5 rounded-xl text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/20"
            />
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2.5 bg-white/5 text-white/60 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-colors border border-white/5">
              All Projects
            </button>
            <button className="px-4 py-2.5 bg-white/5 text-white/60 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-colors border border-white/5">
              Status
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5">
                <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Task</th>
                <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Project</th>
                <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Assignee</th>
                <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Due Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Priority</th>
                <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  </td>
                </tr>
              ) : tasks.map((task, idx) => (
                <motion.tr 
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="hover:bg-white/5 transition-colors group"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/20 group-hover:bg-blue-500/10 group-hover:text-blue-400 group-hover:border-blue-500/20 transition-all">
                        <Tag className="w-4 h-4" />
                      </div>
                      <span className="font-semibold">{task.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-xs text-white/40 font-medium">
                      {projects.find(p => p.id === task.projectId)?.name || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-white/10 flex items-center justify-center text-[10px] font-bold text-blue-400">
                        {users.find(u => u.uid === task.assignedTo)?.name?.charAt(0) || '?'}
                      </div>
                      <span className="text-xs text-white/60 font-medium">
                        {users.find(u => u.uid === task.assignedTo)?.name || 'Unassigned'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <CalendarIcon className="w-3.5 h-3.5 opacity-50" />
                      {format(new Date(task.dueDate), 'MMM dd')}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getPriorityColor(task.priority || 'medium')}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      <span className="text-xs text-white/60 font-medium capitalize">{task.status.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-all group-hover:translate-x-1">
                      <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Task Modal */}
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
                <h2 className="text-2xl font-bold shining-text">New Task</h2>
                <button onClick={() => setShowAddModal(false)} className="text-white/20 hover:text-white"><X className="w-6 h-6" /></button>
              </div>
              
              <form onSubmit={handleAddTask} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Task Title</label>
                  <input 
                    required
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-all"
                    placeholder="e.g. Design system documentation"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Project</label>
                    <select 
                      required
                      value={newProjectId}
                      onChange={e => setNewProjectId(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-all text-white/60"
                    >
                      <option value="" className="bg-[#020617]">Select Project</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id} className="bg-[#020617]">{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Assign To</label>
                    <select 
                      required
                      value={newAssignedTo}
                      onChange={e => setNewAssignedTo(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-all text-white/60"
                    >
                      <option value="" className="bg-[#020617]">Select Assignee</option>
                      {users.map(u => (
                        <option key={u.uid} value={u.uid} className="bg-[#020617]">{u.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Due Date</label>
                    <input 
                      required
                      value={newDueDate}
                      onChange={e => setNewDueDate(e.target.value)}
                      type="date" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-all text-white/60"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Priority</label>
                    <select 
                      value={newPriority}
                      onChange={e => setNewPriority(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-all text-white/60"
                    >
                      <option value="low" className="bg-[#020617]">Low</option>
                      <option value="medium" className="bg-[#020617]">Medium</option>
                      <option value="high" className="bg-[#020617]">High</option>
                      <option value="urgent" className="bg-[#020617]">Urgent</option>
                    </select>
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] mt-4"
                >
                  Create Task
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tasks;
