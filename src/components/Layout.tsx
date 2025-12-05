import React, { PropsWithChildren } from 'react';
import { NavBar } from './NavBar';
import { Footer } from './Footer';
import { QuickExitButton } from './QuickExitButton';

interface RootLayoutProps {
  toggleTheme: () => void;
  isDark: boolean;
}

export const RootLayout = ({ children, toggleTheme, isDark }: PropsWithChildren<RootLayoutProps>) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <NavBar toggleTheme={toggleTheme} isDark={isDark} />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32 pb-40">
        {children}
      </main>
      <QuickExitButton />
      <Footer />
    </div>
  );
};