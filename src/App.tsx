import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Analytics from './pages/Analytics';
import UserManagement from './pages/UserManagement';

// Placeholder pages
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-full text-white/40">
    <h2 className="text-2xl font-bold mb-2 shining-text">{title}</h2>
    <p>This feature is coming soon to the AMG Project Tracker.</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="calendar" element={<Placeholder title="Calendar View" />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="notifications" element={<Placeholder title="Notifications" />} />
            <Route path="management" element={<UserManagement />} />
            <Route path="settings" element={<Placeholder title="Admin Settings" />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
