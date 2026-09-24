import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Service Communication Notice',
  message = 'Unable to connect to the AquaSense analysis service.',
  onRetry,
  className = ''
}) => {
  return (
    <div 
      role="alert"
      className={`rounded-2xl border border-alert/30 bg-alert/5 p-6 text-deep ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-alert/15 text-alert shrink-0" aria-hidden="true">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="space-y-1.5 flex-1">
          <h4 className="font-serif font-semibold text-base text-deep">{title}</h4>
          <p className="text-xs text-soft">
            Connecting to backend at <code className="font-mono bg-line px-1 py-0.5 rounded text-[11px]">{import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000' : 'https://aquasense-river-platform.onrender.com')}</code>. Note: Cloud instances on free tiers may take 30–50s to wake up from inactivity.
          </p>
          {onRetry && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-deep text-white text-xs font-medium hover:bg-deep/90 transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-sea"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
