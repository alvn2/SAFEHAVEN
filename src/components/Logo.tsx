import React from 'react';

interface LogoProps {
  className?: string;
  classNameText?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-10 h-10", classNameText = "text-xl" }) => {
  return (
    <div className="flex items-center gap-2 group select-none">
      <div className={`relative ${className} flex items-center justify-center`}>
        {/* The Sheltering Leaf Icon */}
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md transition-transform group-hover:scale-105"
        >
           {/* Base leaf shape forming a shelter */}
          <path 
            d="M50 15C30 15 15 35 15 60C15 80 30 90 50 90C70 90 85 80 85 60C85 45 75 25 50 15Z" 
            className="fill-primary-500 dark:fill-primary-600"
            fillOpacity="0.2"
          />
          {/* Main vein / Shelter roof line */}
          <path 
            d="M50 15C50 15 20 40 20 65C20 80 35 90 50 90" 
            stroke="currentColor" 
            strokeWidth="8" 
            strokeLinecap="round" 
            className="text-primary-600 dark:text-primary-400"
          />
          {/* Right side curve indicating openness/protection */}
          <path 
             d="M50 15C50 15 80 40 80 65"
             stroke="currentColor" 
             strokeWidth="8"
             strokeLinecap="round"
             className="text-primary-500 dark:text-primary-500"
          />
          {/* Inner heart/person shape representing the user inside */}
          <circle cx="50" cy="60" r="12" className="fill-white dark:fill-gray-900" />
        </svg>
      </div>
      <div className={`font-bold tracking-tight text-gray-900 dark:text-white ${classNameText}`}>
        Safe<span className="text-primary-600 dark:text-primary-400">Haven</span>
      </div>
    </div>
  );
};