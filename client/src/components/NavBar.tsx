import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Book, Heart, Globe, BookOpen, Sun, Moon, LogOut, MessageSquare, Settings, ShieldCheck } from 'lucide-react';
import { Logo } from './Logo';
import { AuthContext } from '../context/AuthContext';
import { Button } from './ui/Button';

export const NavBar = ({ toggleTheme, isDark }: { toggleTheme: () => void, isDark: boolean }) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Volunteers', path: '/volunteers', icon: Users },
    { name: 'Messages', path: '/chat', icon: MessageSquare },
    { name: 'Journal', path: '/seeker/dashboard', icon: Book },
    { name: 'Forum', path: '/forum', icon: Heart },
    { name: 'Community', path: '/community', icon: Globe },
    { name: 'Library', path: '/resources', icon: BookOpen },
  ];

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-300 pointer-events-none ${scrolled ? 'pt-2' : 'pt-4 md:pt-6'}`}>
      <div className={`bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-gray-800 shadow-xl pointer-events-auto flex items-center justify-between transition-all duration-500 ease-in-out ${scrolled ? 'rounded-2xl p-2 w-[98%] lg:w-[95%] max-w-7xl' : 'rounded-full p-2 md:p-3 w-[96%] lg:w-[92%] max-w-7xl'}`}>

        <Link to="/" className="pl-2 pr-4 border-r border-gray-200 dark:border-gray-700 shrink-0 flex items-center">
          <Logo className="w-8 h-8" classNameText="hidden md:block text-lg ml-2" />
        </Link>

        <div className="flex items-center justify-start lg:justify-center gap-1 md:gap-2 px-2 flex-1 overflow-x-auto lg:overflow-visible scrollbar-hide relative" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`p-2.5 rounded-xl transition-all duration-200 relative flex items-center gap-2 group ${isActive ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 font-bold' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                title={item.name}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'scale-110 shrink-0 transition-transform' : 'shrink-0'}`} />
                <span className={`text-sm whitespace-nowrap hidden lg:block ${isActive ? 'inline-block' : 'group-hover:inline-block'}`}>{item.name}</span>
                {isActive && <span className="lg:hidden absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary-500 rounded-full"></span>}
              </Link>
            );
          })}
        </div>

        <div className="pl-2 md:pl-4 border-l border-gray-200 dark:border-gray-700 flex gap-1 md:gap-2 shrink-0 items-center">
          <Button variant="ghost" size="sm" onClick={toggleTheme} className="text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 px-2 lg:px-4" title="Toggle Theme">
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          {user && (
            <>
              {user.role === 'ADMIN' && (
                <Link to="/admin" title="Admin Dashboard">
                  <Button variant="ghost" size="sm" className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 lg:px-4">
                    <ShieldCheck className="w-5 h-5" />
                  </Button>
                </Link>
              )}
              <Link to="/security" title="Settings / Security Center">
                <Button variant="ghost" size="sm" className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 lg:px-4">
                  <Settings className="w-5 h-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 lg:px-4" title="Logout">
                <LogOut className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};