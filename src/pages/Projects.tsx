import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Project, UserProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Calendar, 
  Users, 
  Target,
  Clock,
  Briefcase
} from 'lucide-react';
import { format } from 'date-fns';

const Projects = () => {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [newName, setNewName] = useState('');
  const [newClient, setNewClient] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newBudget, setNewBudget] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setProjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      await addDoc(collection(db, 'projects'), {
        name: newName,
        client: newClient,
        deadline: new Date(newDeadline).toISOString(),
        budget: Number(newBudget),
        managerId: profile.uid,
        status: 'active',
        progress: 0,
        createdAt: serverTimestamp(),
        priority: 'medium'
      });
      setShowAddModal(false);
      setNewName('');
      setNewClient('');
      setNewDeadline('');
      setNewBudget('');
    } catch (error) {
      console.error("Error adding project:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-500">Manage and track all Azariah Management Group initiatives.</p>
        </div>
        {(profile?.role === 'super_admin' || profile?.role === 'project_manager') && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search projects..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            Status
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Target className="w-6 h-6" />
                </div>
                <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal className="w-5 h-5" /></button>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-1">{project.name}</h3>
              <p className="text-sm text-slate-500 mb-6">{project.client || 'Internal Project'}</p>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-slate-500">Progress</span>
                    <span className="text-slate-900">{project.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
                      style={{width: `${project.progress || 0}%`}}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-600 font-medium">
                      {format(new Date(project.deadline), 'MMM dd')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-600 font-medium">12 Tasks</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 rounded-b-2xl flex items-center justify-between">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                    U{i}
                  </div>
                ))}
                <div className="w-7 h-7 rounded-full border-2 border-white bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                  +4
                </div>
              </div>
              <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider
                ${project.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {project.status}
              </span>
            </div>
          </div>
        ))}

        {projects.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No projects found</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-1">Get started by creating your first enterprise project.</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="mt-6 text-indigo-600 font-bold hover:underline"
            >
              Create Project
            </button>
          </div>
        )}
      </div>

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Create New Project</h2>
              <form onSubmit={handleAddProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Project Name</label>
                  <input 
                    required
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    type="text" 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="e.g. Q2 Marketing Campaign"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Client / Department</label>
                  <input 
                    value={newClient}
                    onChange={e => setNewClient(e.target.value)}
                    type="text" 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="e.g. Finance Dept"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Deadline</label>
                    <input 
                      required
                      value={newDeadline}
                      onChange={e => setNewDeadline(e.target.value)}
                      type="date" 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Budget ($)</label>
                    <input 
                      value={newBudget}
                      onChange={e => setNewBudget(e.target.value)}
                      type="number" 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="5000"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-6">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
