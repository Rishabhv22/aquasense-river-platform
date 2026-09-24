import React from 'react';
import { ParameterAnalysis } from '../types';

interface WqiGaugeProps {
  score: number; // 0 to 100
  label: string;
  parameters: ParameterAnalysis[];
}

export const WqiGauge: React.FC<WqiGaugeProps> = ({ score, label, parameters }) => {
  const clamped = Math.min(100, Math.max(0, score));

  // Determine color scheme using theme tokens
  let color = 'var(--sea)';
  let badgeBg = 'bg-[#e6f3f2] text-sea border-sea/30';
  if (clamped < 40) {
    color = 'var(--alert)';
    badgeBg = 'bg-alert/15 text-alert border-alert/30';
  } else if (clamped < 65) {
    color = 'var(--sand)';
    badgeBg = 'bg-sand/15 text-sand border-sand/40';
  }

  const radius = 64;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <div className="rounded-3xl bg-white dark:bg-deep/40 border border-line p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="font-serif font-semibold text-lg text-deep">
            Calculated Water Quality Index (WQI)
          </h3>
          <p className="text-xs text-soft">
            Composite environmental indicator derived from 7 weighted physical-chemical sub-scores
          </p>
        </div>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${badgeBg}`}>
          {label}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Circular Gauge */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-2">
          <div 
            className="relative flex items-center justify-center"
            role="meter"
            aria-valuenow={clamped}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Water Quality Index: ${clamped} out of 100, categorized as ${label}`}
          >
            <svg width={150} height={150} className="transform -rotate-90" aria-hidden="true">
              <circle
                cx={75}
                cy={75}
                r={radius}
                stroke="var(--line)"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              <circle
                cx={75}
                cy={75}
                r={radius}
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-serif text-3xl font-bold text-deep">
                {clamped}
              </span>
              <span className="text-[11px] font-sans font-medium text-soft">
                out of 100
              </span>
            </div>
          </div>
        </div>

        {/* Sub-parameter breakdown bars */}
        <div className="md:col-span-8 space-y-2.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-soft mb-1">
            Parameter Contribution Sub-Scores
          </div>
          {parameters.map((p) => {
            let barBg = 'bg-sea';
            if (p.score < 40) barBg = 'bg-alert';
            else if (p.score < 70) barBg = 'bg-sand';

            return (
              <div key={p.key} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-deep">
                    {p.name} <span className="text-soft text-[11px]">({p.value} {p.unit})</span>
                  </span>
                  <span className="font-semibold text-mid">
                    {p.score.toFixed(0)} / 100
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-line overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${barBg}`}
                    style={{ width: `${Math.min(100, Math.max(0, p.score))}%` }}
                    role="progressbar"
                    aria-valuenow={p.score}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${p.name} sub-score`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
