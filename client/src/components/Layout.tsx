import React, { PropsWithChildren } from 'react';
import { NavBar } from './NavBar';
import { Footer } from './Footer';
import { QuickExitButton } from './QuickExitButton';

interface RootLayoutProps {
  toggleTheme: () => void;
  isDark: boolean;
}

export const EmergencyHotlineBar = () => {
  return (
    <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs py-1.5 px-3 text-center font-medium fixed top-0 left-0 right-0 z-[60] flex flex-wrap items-center justify-center gap-2 sm:gap-4 shadow-sm min-h-[32px]" role="region" aria-label="Crisis hotlines">
      <span className="flex items-center gap-1.5 font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
        <span>24/7 Crisis Lines:</span>
      </span>
      <div className="flex items-center gap-2 sm:gap-3">
        <a href="tel:1199" className="bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-md font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-white inline-flex items-center min-h-[28px]">
          Red Cross: 1199
        </a>
        <a href="tel:+254722178177" className="bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-md font-bold transition-colors hidden xs:inline-flex sm:inline-flex items-center focus:outline-none focus:ring-2 focus:ring-white min-h-[28px]">
          Befrienders: 0722 178 177
        </a>
      </div>
    </div>
  );
};

export const RootLayout = ({ children, toggleTheme, isDark }: PropsWithChildren<RootLayoutProps>) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Skip to Main Content Link for Keyboard / Screen Reader Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[90] focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:font-bold focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>

      <EmergencyHotlineBar />
      <NavBar toggleTheme={toggleTheme} isDark={isDark} />
      <main id="main-content" role="main" tabIndex={-1} className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-28 pb-28 lg:pt-36 lg:pb-36 outline-none">
        {children}
      </main>
      <QuickExitButton />
      <Footer />
    </div>
  );
};