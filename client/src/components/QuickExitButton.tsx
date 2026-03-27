import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, LogOut } from 'lucide-react';

export const QuickExitButton = () => (
  <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col gap-3 items-end pointer-events-none">
    <Link 
      to="/seeker/dashboard"
      className="pointer-events-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur text-gray-700 dark:text-gray-200 p-3 rounded-full shadow-lg border border-gray-300 dark:border-gray-700 hover:scale-105 transition-transform hover:bg-white dark:hover:bg-gray-700"
      title="My Safety Plan"
    >
      <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
    </Link>

    <button
      onClick={() => {
        try { 
            // 1. Wipe DOM completely to prevent back-forward cache viewing
            document.body.innerHTML = '<div style="background:white;width:100vw;height:100vh;"></div>';
            
            // 2. Clear all storage manually (StorageService.logout only clears tokens)
            sessionStorage.clear();
            localStorage.clear();
            
            // 3. Flood history state to overwrite the back button cascade
            for (let i = 0; i < 20; i++) {
                window.history.pushState({}, '', '/');
            }
            
            // 4. Force replace to an innocuous site
            window.location.replace('https://www.google.com');
        } catch (e) {
            window.location.replace('https://www.google.com');
        }
      }}
      className="pointer-events-auto bg-red-600/95 hover:bg-red-700 backdrop-blur-sm text-white font-bold py-3 px-4 sm:px-6 rounded-full shadow-xl shadow-red-900/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 group border-2 border-red-500"
      aria-label="Quick Exit to Google"
      title="Instantly leave this site and lock session"
    >
      <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
      <span className="hidden sm:inline">Quick Exit</span>
    </button>
  </div>
);