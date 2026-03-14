import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Project, Task, ActivityLog } from '../types';
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  ArrowUpRight,
  MoreVertical,
  Zap
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { format } from 'date-fns';

const Dashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

        setProjects(projectsData);
        setTasks(tasksData);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: 'Active Projects', value: projects.filter(p => p.status === 'active').length, icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Completed Tasks', value: tasks.filter(t => t.status === 'completed').length, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Upcoming Deadlines', value: tasks.filter(t => t.status !== 'completed' && new Date(t.dueDate) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)).length, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Overdue Tasks', value: tasks.filter(t => t.status === 'overdue').length, icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
  ];

  const taskStatusData = [
    { name: 'Pending', value: tasks.filter(t => t.status === 'pending').length, color: '#94a3b8' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: '#3b82f6' },
    { name: 'Review', value: tasks.filter(t => t.status === 'review').length, color: '#f59e0b' },
    { name: 'Completed', value: tasks.filter(t => t.status === 'completed').length, color: '#10b981' },
  ];

  const projectProgressData = projects.map(p => ({
    name: p.name,
    progress: p.progress || 0
  })).slice(0, 5);

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="space-y-10">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
          <Zap className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h1 className="text-4xl font-bold shining-text">Enterprise Dashboard</h1>
          <p className="text-white/40 mt-1">Real-time overview of Azariah Management Group operations.</p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-6 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} border border-white/5 group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="flex items-center text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20 uppercase tracking-wider">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12%
              </span>
            </div>
            <h3 className="text-white/40 text-xs font-bold uppercase tracking-widest">{stat.label}</h3>
            <p className="text-3xl font-bold mt-1 tabular-nums">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg">Project Progress</h3>
            <button className="text-white/20 hover:text-white transition-colors"><MoreVertical className="w-5 h-5" /></button>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectProgressData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 10}} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{backgroundColor: 'rgba(2, 6, 23, 0.9)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)'}}
                />
                <Bar dataKey="progress" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg">Task Distribution</h3>
            <button className="text-white/20 hover:text-white transition-colors"><MoreVertical className="w-5 h-5" /></button>
          </div>
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3 ml-8">
              {taskStatusData.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                  <span className="text-xs font-medium text-white/60">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity & Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2 glass-card overflow-hidden"
        >
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
            <h3 className="font-bold">Active Projects</h3>
            <button className="text-blue-400 text-xs font-bold uppercase tracking-widest hover:text-blue-300 transition-colors">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5">
                  <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Project</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Progress</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Deadline</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {projects.slice(0, 5).map((project) => (
                  <tr key={project.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="font-semibold">{project.name}</div>
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
                    <td className="px-6 py-5">
                      <div className="w-full bg-white/5 rounded-full h-1.5 max-w-[100px] overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${project.progress || 0}%` }}
                          transition={{ duration: 1, delay: 0.8 }}
                          className="bg-blue-500 h-full"
                        ></motion.div>
                      </div>
                      <span className="text-[10px] font-bold text-white/30 mt-1.5 block">{project.progress || 0}%</span>
                    </td>
                    <td className="px-6 py-5 text-xs text-white/40">
                      {format(new Date(project.deadline), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-all group-hover:translate-x-1">
                        <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-white" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card p-8"
        >
          <h3 className="font-bold text-lg mb-8">Recent Activity</h3>
          <div className="space-y-8">
            {activities.length > 0 ? activities.map((activity) => (
              <div key={activity.id} className="flex gap-4 group">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center z-10 relative group-hover:border-blue-500/50 transition-colors">
                    <TrendingUp className="w-4 h-4 text-white/40 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <div className="absolute top-8 left-4 w-px h-full bg-white/5 -translate-x-1/2"></div>
                </div>
                <div>
                  <p className="text-sm font-semibold group-hover:text-blue-300 transition-colors">{activity.action}</p>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1.5">{format(new Date(activity.timestamp), 'h:mm a')}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-12">
                <p className="text-sm text-white/20 italic">No recent activity recorded.</p>
              </div>
            )}
          </div>
          <button className="w-full mt-10 py-3 text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-all">
            View Audit Log
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
