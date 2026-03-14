import React, { useState, useEffect } from 'react';
import { Project, Task } from '../types';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const Analytics = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
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
        console.error("Analytics fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const projectStatusData = [
    { name: 'Active', value: projects.filter(p => p.status === 'active').length || 0 },
    { name: 'Completed', value: projects.filter(p => p.status === 'completed').length || 0 },
    { name: 'Delayed', value: projects.filter(p => p.status === 'delayed').length || 0 },
    { name: 'Archived', value: projects.filter(p => p.status === 'archived').length || 0 },
  ].filter(d => d.value > 0);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#94a3b8'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold shining-text">Advanced Analytics</h1>
        <p className="text-white/40 mt-2">Deep dive into Azariah Management Group performance metrics.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-bold mb-6 text-white/80">Project Status Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectStatusData.length > 0 ? projectStatusData : [{name: 'No Data', value: 1}]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                  {projectStatusData.length === 0 && <Cell fill="#ffffff10" />}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-bold mb-6 text-white/80">Team Workload (Tasks Assigned)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{name: 'Team A', tasks: 12}, {name: 'Team B', tasks: 19}, {name: 'Team C', tasks: 8}]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#ffffff40', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#ffffff40', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-bold mb-6 text-white/80">System Performance Trend</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={[
              {name: 'Jan', value: 400},
              {name: 'Feb', value: 300},
              {name: 'Mar', value: 600},
              {name: 'Apr', value: 800},
              {name: 'May', value: 500},
              {name: 'Jun', value: 900},
            ]}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#ffffff40', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#ffffff40', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
              />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;
