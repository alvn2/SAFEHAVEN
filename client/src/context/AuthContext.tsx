import React, { useState, createContext, useEffect, useCallback } from 'react';
import { User } from '../types';
import { authApi, setToken, getToken } from '../lib/api';

export const AuthContext = createContext<{
  user: User | null;
  passphrase: string;
  isLoading: boolean;
  login: (name: string, pass: string) => Promise<boolean>;
  registerSeeker: (name: string, pass: string, agreedToTerms?: boolean, becomePeerListener?: boolean) => Promise<string>;
  recover: (name: string, phrase: string, newPass: string) => Promise<boolean>;
  logout: () => void;
}>({
  user: null,
  passphrase: '',
  isLoading: true,
  login: async () => false,
  registerSeeker: async () => '',
  recover: async () => false,
  logout: () => {}
});

const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 Minutes

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [passphrase, setPassphrase] = useState('');
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from persisted token on mount
  useEffect(() => {
    const savedToken = sessionStorage.getItem('sh_token');
    if (savedToken) {
      setToken(savedToken);
      authApi.me()
        .then(u => {
          setUser({ id: u.id, username: u.username, role: u.role, recoveryKey: u.recoveryKey, hasVolunteerProfile: u.hasVolunteerProfile });
          setLastActivity(Date.now());
        })
        .catch(() => {
          sessionStorage.removeItem('sh_token');
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const data = await authApi.login(username, password);
      setToken(data.token);
      sessionStorage.setItem('sh_token', data.token);
      setUser({ ...data.user, hasVolunteerProfile: data.user.hasVolunteerProfile || false });
      setPassphrase(password);
      setLastActivity(Date.now());
      return true;
    } catch {
      return false;
    }
  };

  const recover = async (username: string, phrase: string, newPass: string): Promise<boolean> => {
    try {
      const data = await authApi.recover(username, phrase, newPass);
      setToken(data.token);
      sessionStorage.setItem('sh_token', data.token);
      setUser(data.user);
      setPassphrase(newPass);
      setLastActivity(Date.now());
      return true;
    } catch (error: any) {
      throw new Error(error.message || 'Recovery failed.');
    }
  };

  const registerSeeker = async (username: string, password: string, agreedToTerms: boolean = true, becomePeerListener: boolean = false): Promise<string> => {
    // Generate a recovery phrase client-side
    const WORD_LIST = ["apple", "river", "stone", "mountain", "sky", "blue", "green", "hope", "faith", "light", "peace", "calm", "strong", "tree", "ocean", "wind", "rain", "sun", "moon", "star", "dream", "path", "walk", "safe"];
    const phrase = Array.from({ length: 12 }, () => WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]).join(' ');

    const data = await authApi.register(username, password, phrase, agreedToTerms, becomePeerListener);
    setToken(data.token);
    sessionStorage.setItem('sh_token', data.token);
    setUser(data.user);
    setPassphrase(password);
    setLastActivity(Date.now());
    return phrase;
  };

  const logout = useCallback(() => {
    setToken(null);
    sessionStorage.removeItem('sh_token');
    setUser(null);
    setPassphrase('');
  }, []);

  // Session timeout
  useEffect(() => {
    if (!user) return;

    const checkActivity = () => {
      if (Date.now() - lastActivity > SESSION_TIMEOUT) {
        logout();
      }
    };

    const updateActivity = () => setLastActivity(Date.now());

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
  }, [user, lastActivity, logout]);

  return (
    <AuthContext.Provider value={{ user, passphrase, isLoading, login, registerSeeker, recover, logout }}>
      {children}
    </AuthContext.Provider>
  );
};