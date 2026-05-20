import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

export type User = {
  email: string;
  name: string;
};

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, pass: string) => Promise<boolean>;
  resetPassword: (email: string, newPass: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const storedAuth = localStorage.getItem('currentUser');
    if (storedAuth) {
      try {
        setCurrentUser(JSON.parse(storedAuth));
      } catch (e) { }
    }
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');
      
      const { token, user } = data;
      setCurrentUser(user);
      localStorage.setItem('token', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      toast.success(`Welcome back, ${user.name}!`);
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Invalid email or password');
      return false;
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pass }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');

      toast.success('Registration successful. Please login.');
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Error creating account');
      return false;
    }
  };
  const resetPassword = async (email: string, newPass: string) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword: newPass }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Reset failed');
      
      toast.success('Password updated successfully. Please login.');
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Error resetting password');
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, register, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
