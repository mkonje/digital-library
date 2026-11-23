// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  avatar_url?: string | null;
  email_verified: number;
}

export interface UserSubscription {
  id: string;
  plan_id: string;
  plan_name: string;
  status: string;
  end_date: number;
}

interface AuthContextType {
  user: User | null;
  subscription: UserSubscription | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (fullName: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
        setSubscription(data.subscription || null);
      } else {
        setUser(null);
        setSubscription(null);
      }
    } catch {
      setUser(null);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Imeshindwa kuingia' };
      }
      setUser(data.user);
      await refreshUser();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Hitilafu ya mtandao' };
    }
  };

  const register = async (fullName: string, email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password: pass }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Imeshindwa kusajili' };
      }
      setUser(data.user);
      await refreshUser();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Hitilafu ya mtandao' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } finally {
      setUser(null);
      setSubscription(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        subscription,
        loading,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
