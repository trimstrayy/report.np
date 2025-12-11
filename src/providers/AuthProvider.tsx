import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/models/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const dummyUser: User = {
  id: '1',
  name: 'Ram Bahadur',
  email: 'ram@example.com',
  phone: '+977 9812345678',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  points: 1250,
  rank: 'Gold',
  reportsCount: 47,
  resolvedCount: 32,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (email && password) {
      setUser(dummyUser);
      return true;
    }
    return false;
  };

  const signup = async (name: string, email: string, phone: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (name && email && phone && password) {
      setUser({
        ...dummyUser,
        name,
        email,
        phone,
        points: 0,
        rank: 'Bronze',
        reportsCount: 0,
        resolvedCount: 0,
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
