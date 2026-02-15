import React from 'react';

function Logo({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  return (
    <div className={`${sizes[size]} ${className}`}>
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Rounded square background */}
        <rect width="48" height="48" rx="12" fill="url(#logoGradient)"/>
        
        {/* Letter P */}
        <path
          d="M16 12H24C27.866 12 31 15.134 31 19C31 22.866 27.866 26 24 26H20V36H16V12Z M20 16V22H24C25.657 22 27 20.657 27 19C27 17.343 25.657 16 24 16H20Z"
          fill="white"
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="logoGradient" x1="0" y1="0" x2="48" y2="48">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default Logo;