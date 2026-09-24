import React from 'react';
import { Database, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  onReset?: () => void;
  resetText?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Records Found',
  message = 'No water quality records match your current filter criteria.',
  onReset,
  resetText = 'Clear Filters',
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-10 text-center rounded-2xl border border-line bg-white dark:bg-deep/20 ${className}`}>
      <div className="p-3.5 rounded-full bg-line text-mid mb-3" aria-hidden="true">
        <Database className="w-6 h-6" />
      </div>
      <h3 className="font-serif font-semibold text-lg text-deep mb-1">{title}</h3>
      <p className="text-sm text-mid max-w-md mb-5 leading-relaxed">{message}</p>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sea text-white text-xs font-medium hover:bg-sea/90 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{resetText}</span>
        </button>
      )}
    </div>
  );
};
