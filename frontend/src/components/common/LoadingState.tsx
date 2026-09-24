import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading analysis data...',
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-10 h-10'
  };

  return (
    <div 
      role="status" 
      aria-live="polite"
      className={`flex flex-col items-center justify-center p-8 gap-3 text-mid ${className}`}
    >
      <Loader2 className={`${sizeClasses[size]} animate-spin text-sea`} aria-hidden="true" />
      <span className="text-sm font-medium tracking-tight text-mid">{message}</span>
      <span className="sr-only">Loading content, please wait...</span>
    </div>
  );
};
