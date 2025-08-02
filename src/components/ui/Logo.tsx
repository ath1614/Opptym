import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <div className={`flex items-center space-x-3 ${className} group`}>
      {/* Circular Icon with Animation */}
      <div className={`${sizeClasses[size]} relative transform group-hover:scale-110 transition-transform duration-300`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
          {/* Dashed circle background */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="3"
            strokeDasharray="8,8"
            strokeLinecap="round"
            className="animate-pulse"
          />
          
          {/* Upper right circle */}
          <circle
            cx="65"
            cy="35"
            r="8"
            fill="#33A0DA"
            className="animate-bounce"
            style={{ animationDelay: '0.1s' }}
          />
          
          {/* Lower left circle */}
          <circle
            cx="35"
            cy="65"
            r="8"
            fill="#21478F"
            className="animate-bounce"
            style={{ animationDelay: '0.3s' }}
          />
          
          {/* Center dot */}
          <circle
            cx="50"
            cy="50"
            r="3"
            fill="url(#gradient)"
            className="animate-ping"
          />
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#33A0DA" />
              <stop offset="100%" stopColor="#21478F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {/* Text with Animation */}
      {showText && (
        <div className="flex flex-col transform group-hover:translate-x-1 transition-transform duration-300">
          <span className={`font-bold uppercase text-[#33A0DA] ${textSizes[size]} tracking-wider drop-shadow-sm`}>
            OPPTYM
          </span>
          <span className={`text-xs uppercase text-[#21478F] font-medium tracking-wider opacity-80`}>
            AI Powered Automation
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo; 