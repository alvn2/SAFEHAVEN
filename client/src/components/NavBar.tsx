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

  const defaultNavItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Volunteers', path: '/volunteers', icon: Users },
    { name: 'Messages', path: '/chat', icon: MessageSquare },
    { name: 'Journal', path: '/seeker/dashboard', icon: Book },
    { name: 'Forum', path: '/forum', icon: Heart },
    { name: 'Community', path: '/community', icon: Globe },
    { name: 'Library', path: '/resources', icon: BookOpen },
  ];

  const navItems = [...defaultNavItems];
  if (user && (user.role === 'VOLUNTEER_APPROVED' || user.role === 'ADMIN')) {
    navItems.splice(4, 0, { name: 'Care Dashboard', path: '/volunteer/dashboard', icon: Heart });
  }

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <>
      {/* Top Floating Navbar (Desktop & Tablet: full pill; Mobile: clean header) */}
      <header className={`fixed top-8 sm:top-7 left-0 right-0 z-50 flex justify-center transition-all duration-300 pointer-events-none ${scrolled ? 'pt-0' : 'pt-1 md:pt-2'}`}>
        <div className={`bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-gray-800 shadow-xl pointer-events-auto flex items-center justify-between transition-all duration-300 ease-in-out ${scrolled ? 'rounded-2xl p-2 w-[95%] max-w-7xl' : 'rounded-2xl sm:rounded-full p-2 md:p-3 w-[94%] lg:w-[92%] max-w-7xl'}`}>

          <Link to="/" className="pl-2 pr-3 sm:pr-4 border-r border-gray-200 dark:border-gray-700 shrink-0 flex items-center" aria-label="SafeHaven Home">
            <Logo className="w-7 h-7 sm:w-8 sm:h-8" classNameText="text-base sm:text-lg ml-2 font-bold" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center justify-center gap-1.5 px-2 flex-1 relative" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`p-2.5 rounded-xl transition-all duration-200 relative flex items-center gap-2 group min-h-[44px] ${isActive ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 font-bold' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  title={item.name}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'scale-110 shrink-0 transition-transform' : 'shrink-0'}`} />
                  <span className="text-sm whitespace-nowrap">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Action buttons (Theme Toggle, Settings, Profile, Logout) */}
          <div className="pl-2 sm:pl-3 border-l border-gray-200 dark:border-gray-700 flex gap-1 sm:gap-2 shrink-0 items-center">
            <Button variant="ghost" size="sm" onClick={toggleTheme} className="text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 px-2.5 sm:px-3 min-w-[40px] min-h-[40px]" title="Toggle Theme" aria-label="Toggle Theme">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {user ? (
              <>
                {user.role === 'ADMIN' && (
                  <Link to="/admin" title="Admin Dashboard" aria-label="Admin Dashboard">
                    <Button variant="ghost" size="sm" className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2.5 sm:px-3 min-w-[40px] min-h-[40px]">
                      <ShieldCheck className="w-5 h-5" />
                    </Button>
                  </Link>
                )}
                <Link to="/security" title="Settings / Security Center" aria-label="Settings / Security Center">
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 px-2.5 sm:px-3 min-w-[40px] min-h-[40px]">
                    <Settings className="w-5 h-5" />
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-2.5 sm:px-3 min-w-[40px] min-h-[40px]" title="Logout" aria-label="Logout">
                  <LogOut className="w-5 h-5" />
                </Button>
              </>
            ) : (
              <Link to="/auth" className="hidden sm:inline-flex">
                <Button variant="primary" size="sm" className="text-xs sm:text-sm px-3.5">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Phone & Tablet < 1024px) */}
      <nav 
        aria-label="Mobile Bottom Navigation" 
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 flex items-center justify-around px-1 py-1 shadow-2xl safe-area-inset-bottom"
      >
        {navItems.slice(0, 6).map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl transition-colors ${
                isActive 
                  ? 'text-primary-600 dark:text-primary-400 font-bold bg-primary-50/50 dark:bg-primary-950/40' 
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-[10px] font-medium tracking-tight mt-0.5 truncate max-w-[56px] text-center">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};