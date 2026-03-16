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
  ChevronRight,
  MessageSquare,
  Paperclip,
  History,
  Trash2,
  Flag
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const Tasks = () => {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newProjectId, setNewProjectId] = useState('');
  const [newAssignedTo, setNewAssignedTo] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, projectsRes, usersRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/projects'),
        fetch('/api/users/sync')
      ]);
      
      const [tasksData, projectsData, usersData] = await Promise.all([
        tasksRes.json(),
        projectsRes.json(),
        usersRes.json()
      ]);

      if (Array.isArray(tasksData)) {
        setTasks(tasksData);
      } else {
        setTasks([]);
      }

      if (Array.isArray(projectsData)) {
        setProjects(projectsData);
      } else {
        setProjects([]);
      }

      if (Array.isArray(usersData)) {
        setUsers(usersData);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Fetch tasks data error:", err);
      toast.error("Failed to load tasks and related data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSubmitting(true);

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
          status: 'todo',
          creatorId: profile.uid
        })
      });

      const data = await res.json();

      if (res.ok) {
        setTasks([data, ...tasks]);
        setShowAddModal(false);
        setNewTitle('');
        setNewProjectId('');
        setNewAssignedTo('');
        setNewDueDate('');
        setNewPriority('medium');
        toast.success("Task created successfully");
      } else {
        toast.error(data.error || "Failed to create task");
      }
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error("An error occurred while creating the task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const updatedTask = await res.json();
        setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
        if (selectedTask?.id === taskId) {
          setSelectedTask(updatedTask);
        }
        toast.success(`Task status updated to ${newStatus.replace('_', ' ')}`);
      } else {
        toast.error("Failed to update task status");
      }
    } catch (err) {
      console.error("Failed to update task status:", err);
      toast.error("An error occurred while updating task status");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      if (res.ok) {
        setTasks(tasks.filter(t => t.id !== taskId));
        if (selectedTask?.id === taskId) {
          setSelectedTask(null);
        }
        toast.success("Task deleted successfully");
      } else {
        toast.error("Failed to delete task");
      }
    } catch (err) {
      console.error("Failed to delete task:", err);
      toast.error("An error occurred while deleting the task");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'overdue': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-600" />;
      default: return <Clock className="w-4 h-4 text-slate-300" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-50 text-red-600 border-red-100';
      case 'high': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'medium': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || t.status === statusFilter;
    const matchesPriority = priorityFilter === '' || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getUserName = (userId: string) => {
    const user = users.find(u => u.uid === userId);
    return user?.name || 'Unassigned';
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-bold shining-text">Tasks</h1>
          <p className="text-slate-400 mt-2">Track individual deliverables and team assignments.</p>
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
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 bg-slate-50/50">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-300"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 text-slate-500 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-slate-100 transition-colors border border-slate-100 focus:outline-none"
            >
              <option value="">All Status</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <select 
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 text-slate-500 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-slate-100 transition-colors border border-slate-100 focus:outline-none"
            >
              <option value="">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Task</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Project</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assignee</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Due Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Priority</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredTasks.map((task, idx) => (
                    <motion.tr 
                      layout
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-slate-50 transition-colors group cursor-pointer"
                      onClick={() => setSelectedTask(task)}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-all">
                            <Tag className="w-4 h-4" />
                          </div>
                          <span className={`font-semibold text-slate-900 ${task.status === 'completed' ? 'line-through text-slate-400' : ''}`}>
                            {task.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs text-slate-400 font-medium">
                          {getProjectName(task.projectId)}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                            {getUserName(task.assignedTo).charAt(0)}
                          </div>
                          <span className="text-xs text-slate-600 font-medium">
                            {getUserName(task.assignedTo)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
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
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <select 
                            value={task.status}
                            onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                            className="bg-transparent border-none text-xs text-slate-600 font-medium capitalize focus:ring-0 cursor-pointer hover:text-blue-600 transition-colors"
                          >
                            <option value="todo">To Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-all text-slate-300 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-blue-50 rounded-lg transition-all group-hover:translate-x-1">
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
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
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card w-full max-w-lg p-8 z-10 relative"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold shining-text">New Task</h2>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
              </div>
              
              <form onSubmit={handleAddTask} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Task Title</label>
                  <input 
                    required
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-all text-slate-900"
                    placeholder="e.g. Design system documentation"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Project</label>
                    <select 
                      required
                      value={newProjectId}
                      onChange={e => setNewProjectId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-all text-slate-600"
                    >
                      <option value="">Select Project</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Assign To</label>
                    <select 
                      required
                      value={newAssignedTo}
                      onChange={e => setNewAssignedTo(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-all text-slate-600"
                    >
                      <option value="">Select Assignee</option>
                      {users.map(u => (
                        <option key={u.uid} value={u.uid}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Due Date</label>
                    <input 
                      required
                      value={newDueDate}
                      onChange={e => setNewDueDate(e.target.value)}
                      type="date" 
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-all text-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Priority</label>
                    <select 
                      value={newPriority}
                      onChange={e => setNewPriority(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-all text-slate-600"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] mt-4"
                >
                  {isSubmitting ? "Creating..." : "Create Task"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Task Details Modal */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTask(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card w-full max-w-2xl h-[80vh] flex flex-col z-10 relative"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleUpdateStatus(selectedTask.id, selectedTask.status === 'completed' ? 'todo' : 'completed')}
                    className={`p-2 rounded-xl transition-all ${selectedTask.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-white border border-slate-200 text-slate-300 hover:text-blue-600'}`}
                  >
                    <CheckCircle2 className="w-6 h-6" />
                  </button>
                  <div>
                    <h2 className={`text-xl font-bold text-slate-900 ${selectedTask.status === 'completed' ? 'line-through text-slate-400' : ''}`}>{selectedTask.title}</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{getProjectName(selectedTask.projectId)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleDeleteTask(selectedTask.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-all text-slate-300 hover:text-red-600"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => setSelectedTask(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"><X className="w-6 h-6" /></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-8">
                    <div>
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Description
                      </h3>
                      <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                        {selectedTask.description || "No description provided for this task. Add more details to help your team understand the requirements."}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <History className="w-4 h-4" />
                        Activity
                      </h3>
                      <div className="space-y-4">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                            <History className="w-4 h-4 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-sm text-slate-600"><span className="font-bold">System</span> created this task</p>
                            <p className="text-[10px] text-slate-400 mt-1">{format(new Date(selectedTask.createdAt), 'MMM dd, yyyy p')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Status</label>
                        <select 
                          value={selectedTask.status}
                          onChange={(e) => handleUpdateStatus(selectedTask.id, e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-500/50"
                        >
                          <option value="todo">To Do</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Priority</label>
                        <div className={`px-3 py-2 rounded-lg border text-sm font-bold capitalize ${getPriorityColor(selectedTask.priority)}`}>
                          {selectedTask.priority}
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Assignee</label>
                        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                            {getUserName(selectedTask.assignedTo).charAt(0)}
                          </div>
                          <span className="text-sm text-slate-700">
                            {getUserName(selectedTask.assignedTo)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Due Date</label>
                        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700">
                          <CalendarIcon className="w-4 h-4 text-slate-400" />
                          {format(new Date(selectedTask.dueDate), 'MMM dd, yyyy')}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button className="flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
                        <Paperclip className="w-4 h-4" />
                        Attachments
                      </button>
                      <button className="flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
                        <MessageSquare className="w-4 h-4" />
                        Comments
                      </button>
                    </div>
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

export default Tasks;
