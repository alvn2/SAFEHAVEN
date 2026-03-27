import React from 'react';

export const Card: React.FC<{
    children: React.ReactNode;
    className?: string;
    hoverable?: boolean;
    style?: React.CSSProperties;
    variant?: 'default' | 'glass'
}> = ({
    children,
    className = '',
    hoverable = false,
    variant = 'default',
    style
}) => (
        <div
            className={`
      rounded-2xl overflow-hidden transition-all duration-300
      ${variant === 'glass'
                    ? 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/60 dark:border-white/10 shadow-glass'
                    : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-sm'
                }
      ${hoverable ? 'hover:shadow-xl hover:-translate-y-1 hover:border-primary-300 dark:hover:border-gray-600' : ''} 
      ${className}
    `}
            style={style}
        >
            {children}
        </div>
    );
