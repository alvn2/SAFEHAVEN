import React, { useState, createContext, useEffect } from 'react';
import { User } from '../types';
import { StorageService } from '../lib/storage';

export const AuthContext = createContext<{
  user: User | null;
  passphrase: string;
  login: (name: string, pass: string) => boolean;
  registerSeeker: (name: string, pass: string) => string;
  logout: () => void;
}>({ user: null, passphrase: '', login: () => false, registerSeeker: () => '', logout: () => {} });

const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 Minutes

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [user, setUser] = useState<User | null>(StorageService.getUser());
  const [passphrase, setPassphrase] = useState('');
  const [lastActivity, setLastActivity] = useState(Date.now());

  const login = (u: string, p: string) => {
    const foundUser = StorageService.login(u, p);
    if (foundUser) {
        setUser(foundUser);
        setPassphrase(p);
        setLastActivity(Date.now());
        return true;
    }
    return false;
  };

  const registerSeeker = (u: string, p: string) => {
      const { user: newUser, recoveryKey } = StorageService.registerSeeker(u, p);
      setUser(newUser);
      setPassphrase(p);
      setLastActivity(Date.now());
      return recoveryKey;
  };

  const logout = () => {
      StorageService.logout();
      setUser(null);
      setPassphrase('');
  };

  useEffect(() => {
    if (!user) return;

    const checkActivity = () => {
        const now = Date.now();
        if (now - lastActivity > SESSION_TIMEOUT) {
            logout();
        }
    };

    const updateActivity = () => {
        setLastActivity(Date.now());
    };

    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keypress', updateActivity);
    window.addEventListener('click', updateActivity);
    window.addEventListener('scroll', updateActivity);

    const interval = setInterval(checkActivity, 60000);

    return () => {
        window.removeEventListener('mousemove', updateActivity);
        window.removeEventListener('keypress', updateActivity);
        window.removeEventListener('click', updateActivity);
        window.removeEventListener('scroll', updateActivity);
        clearInterval(interval);
    };
  }, [user, lastActivity]);

  return (
    <AuthContext.Provider value={{ user, passphrase, login, registerSeeker, logout }}>
      {children}
    </AuthContext.Provider>
  );
};