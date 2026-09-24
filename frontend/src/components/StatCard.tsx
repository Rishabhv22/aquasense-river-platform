import React from 'react';

interface StatCardProps {
  label?: string;
  title?: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  subtitle?: string;
  statusText?: string;
  statusVariant?: 'good' | 'warning' | 'critical' | 'neutral';
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  title,
  value,
  unit,
  icon,
  subtitle,
  statusText,
  statusVariant = 'neutral',
  trend,
}) => {
  const displayLabel = label || title || '';

  const statusColors = {
    good: 'text-sea bg-sea/10 border-sea/20',
    warning: 'text-[#9c7627] dark:text-sand bg-sand/15 border-sand/30',
    critical: 'text-alert bg-alert/10 border-alert/20',
    neutral: 'text-mid bg-sky/70 dark:bg-white/5 border-line',
  }[statusVariant];

  return (
    <div className="bg-white dark:bg-[#10252e] border border-line rounded-2xl p-5 sm:p-6 shadow-subtle hover:border-sea/30 transition-all duration-150 flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-soft block">
            {displayLabel}
          </span>
          {icon && (
            <div className="text-soft group-hover:text-sea transition-colors">
              {icon}
            </div>
          )}
        </div>

        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="font-sans text-3xl sm:text-4xl font-bold tracking-tight text-deep">
            {value}
          </span>
          {unit && (
            <span className="text-xs font-medium text-soft">
              {unit}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between gap-2 text-xs">
        {statusText ? (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${statusColors}`}>
            {statusText}
          </span>
        ) : subtitle ? (
          <span className="text-mid truncate text-xs">
            {subtitle}
          </span>
        ) : <div />}

        {trend && (
          <span className="text-[11px] text-soft font-mono font-medium shrink-0">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};
