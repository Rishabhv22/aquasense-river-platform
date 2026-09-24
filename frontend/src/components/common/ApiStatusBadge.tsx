import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';

export const ApiStatusBadge: React.FC = () => {
  const [status, setStatus] = useState<'online' | 'checking' | 'offline'>('checking');
  const [recordCount, setRecordCount] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    api.checkHealth()
      .then((data) => {
        if (mounted) {
          setStatus(data.status === 'online' ? 'online' : 'offline');
          setRecordCount(data.dataset_records);
        }
      })
      .catch(() => {
        if (mounted) {
          setStatus('offline');
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div 
      className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-medium border border-line bg-white/70 dark:bg-deep/40 backdrop-blur-xs text-mid"
      title={status === 'online' ? `Backend Online (${recordCount ?? 1864} CPCB records)` : 'Backend analysis service offline'}
    >
      <span 
        className={`w-2 h-2 rounded-full ${
          status === 'online' 
            ? 'bg-sea animate-pulse' 
            : status === 'checking' 
            ? 'bg-sand' 
            : 'bg-alert'
        }`} 
      />
      <span className="capitalize font-mono">
        {status === 'online' ? 'ML Engine Online' : status === 'checking' ? 'Connecting...' : 'API Offline'}
      </span>
      {status === 'online' && recordCount && (
        <span className="text-[10px] text-soft border-l border-line pl-1.5 hidden sm:inline">
          {recordCount} Records
        </span>
      )}
    </div>
  );
};
