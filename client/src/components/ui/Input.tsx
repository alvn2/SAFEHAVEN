import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => (
    <div className="w-full">
        {label && <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1.5">{label}</label>}
        <input
            className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white dark:bg-gray-800/80 dark:text-white shadow-sm ${error
                    ? 'border-red-300 dark:border-red-500 focus:ring-red-200'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                } ${className}`}
            {...props}
        />
        {error && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>}
    </div>
);
