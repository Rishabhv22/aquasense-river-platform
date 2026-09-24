import React from 'react';

interface ParameterSliderProps {
  label: string;
  name: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  recommendedRange: string;
  guidance?: string;
  statusBadge: {
    text: string;
    variant: 'healthy' | 'normal' | 'moderate' | 'warning' | 'critical';
  };
  onChange: (val: number) => void;
}

export const ParameterSlider: React.FC<ParameterSliderProps> = ({
  label,
  name,
  value,
  unit,
  min,
  max,
  step,
  recommendedRange,
  guidance,
  statusBadge,
  onChange,
}) => {
  const statusColors = {
    healthy: 'text-emerald-600 dark:text-emerald-400 dot-emerald',
    normal: 'text-sky-600 dark:text-sky-400 dot-sky',
    moderate: 'text-amber-600 dark:text-amber-400 dot-amber',
    warning: 'text-amber-600 dark:text-amber-400 dot-amber',
    critical: 'text-rose-600 dark:text-rose-400 dot-rose',
  }[statusBadge.variant];

  const dotBg = {
    healthy: 'bg-emerald-500',
    normal: 'bg-sky-500',
    moderate: 'bg-amber-500',
    warning: 'bg-amber-500',
    critical: 'bg-rose-500',
  }[statusBadge.variant];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      onChange(Math.min(max, Math.max(min, val)));
    }
  };

  const inputId = `param-${name}`;

  return (
    <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-line shadow-subtle hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-150 group">
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <label htmlFor={inputId} className="text-xs font-semibold text-deep block cursor-pointer">
            {label}
          </label>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-soft">
            <span className={`w-1.5 h-1.5 rounded-full ${dotBg}`} />
            <span className={statusColors}>{statusBadge.text}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 border border-line rounded-lg px-2 py-0.5 shadow-2xs">
          <input
            id={inputId}
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={handleInputChange}
            className="w-14 text-right text-xs font-mono font-semibold text-deep bg-transparent focus:outline-hidden"
            aria-label={`${label} numeric value`}
          />
          {unit && (
            <span className="text-[10px] text-soft font-normal pl-0.5">
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Modern Sleek Range Slider */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-600 dark:accent-sky-400"
        aria-label={`${label} slider`}
      />

      <div className="flex justify-between items-center text-[10px] text-soft mt-1.5 font-mono">
        <span>Min: {min}</span>
        <span className="text-mid italic font-sans truncate max-w-[200px]" title={guidance || recommendedRange}>
          {recommendedRange}
        </span>
        <span>Max: {max}</span>
      </div>
    </div>
  );
};
