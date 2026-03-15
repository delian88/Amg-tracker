import React, { useState, useEffect, useContext } from 'react';
import { UserProfile } from '../types';

interface AuthContextType {
  user: { email: string; uid: string } | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const HARDCODED_USERS = [
  { email: 'info@azariahmg.com', password: 'Admin@webmaster$123', role: 'super_admin', name: 'Super Admin' },
  { email: 'chiffon@azariahmg.com', password: '12345', role: 'team_member', name: 'Chiffon' },
  { email: 'Dele@azariahmg.com', password: '12345', role: 'team_member', name: 'Dele' },
  { email: 'Joseph@azariahmg.com', password: '12345', role: 'team_member', name: 'Joseph' },
];

export const AuthContext = React.createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ email: string; uid: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('amg_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      syncProfile(userData);
    } else {
      setLoading(false);
    }
  }, []);

  const syncProfile = async (userData: { email: string; uid: string }) => {
    try {
      const res = await fetch('/api/users/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: userData.uid,
          name: userData.email.split('@')[0],
          email: userData.email,
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const foundUser = HARDCODED_USERS.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const userData = { email: foundUser.email, uid: foundUser.email.replace(/[@.]/g, '_') };
      setUser(userData);
      localStorage.setItem('amg_user', JSON.stringify(userData));
      await syncProfile(userData);
    } else {
      throw new Error("Invalid email or password");
    }
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('amg_user');
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
