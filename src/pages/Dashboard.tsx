import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, limit, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Project, Task, ActivityLog } from '../types';
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  ArrowUpRight,
  MoreVertical
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
    const qProjects = query(collection(db, 'projects'), limit(10));
    const qTasks = query(collection(db, 'tasks'), limit(50));
    const qActivities = query(collection(db, 'activityLogs'), orderBy('timestamp', 'desc'), limit(5));

    const unsubProjects = onSnapshot(qProjects, (snap) => {
      setProjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
    });

    const unsubTasks = onSnapshot(qTasks, (snap) => {
      setTasks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)));
      setLoading(false);
    });

    const unsubActivities = onSnapshot(qActivities, (snap) => {
      setActivities(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActivityLog)));
    });

    return () => {
      unsubProjects();
      unsubTasks();
      unsubActivities();
    };
  }, []);

  const stats = [
    { label: 'Active Projects', value: projects.filter(p => p.status === 'active').length, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Completed Tasks', value: tasks.filter(t => t.status === 'completed').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Upcoming Deadlines', value: tasks.filter(t => t.status !== 'completed' && new Date(t.dueDate) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)).length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Overdue Tasks', value: tasks.filter(t => t.status === 'overdue').length, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  const taskStatusData = [
    { name: 'Pending', value: tasks.filter(t => t.status === 'pending').length, color: '#94a3b8' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: '#6366f1' },
    { name: 'Review', value: tasks.filter(t => t.status === 'review').length, color: '#f59e0b' },
    { name: 'Completed', value: tasks.filter(t => t.status === 'completed').length, color: '#10b981' },
  ];

  const projectProgressData = projects.map(p => ({
    name: p.name,
    progress: p.progress || 0
  })).slice(0, 5);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Enterprise Dashboard</h1>
        <p className="text-slate-500">Welcome back. Here's what's happening across Azariah Management Group.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12%
              </span>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{stat.label}</h3>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900">Project Progress Overview</h3>
            <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="w-5 h-5" /></button>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectProgressData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="progress" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900">Tasks by Status</h3>
            <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="w-5 h-5" /></button>
          </div>
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 ml-4">
              {taskStatusData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                  <span className="text-sm text-slate-600">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Active Projects</h3>
            <button className="text-indigo-600 text-sm font-semibold hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Project Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Deadline</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.slice(0, 5).map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{project.name}</div>
                      <div className="text-xs text-slate-500">{project.client}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${project.status === 'active' ? 'bg-blue-50 text-blue-700' : 
                          project.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 
                          'bg-slate-50 text-slate-700'}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-full bg-slate-100 rounded-full h-1.5 max-w-[100px]">
                        <div className="bg-indigo-600 h-1.5 rounded-full" style={{width: `${project.progress || 0}%`}}></div>
                      </div>
                      <span className="text-xs text-slate-500 mt-1 block">{project.progress || 0}%</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {format(new Date(project.deadline), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <ArrowUpRight className="w-4 h-4 text-slate-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {activities.length > 0 ? activities.map((activity) => (
              <div key={activity.id} className="flex gap-4">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center z-10 relative">
                    <TrendingUp className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="absolute top-8 left-4 w-px h-full bg-slate-100 -translate-x-1/2"></div>
                </div>
                <div>
                  <p className="text-sm text-slate-900 font-medium">{activity.action}</p>
                  <p className="text-xs text-slate-500 mt-1">{format(new Date(activity.timestamp), 'h:mm a')}</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-slate-500 italic">No recent activity recorded.</p>
            )}
          </div>
          <button className="w-full mt-8 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">
            View Audit Log
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
