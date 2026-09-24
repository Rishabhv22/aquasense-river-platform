import React from 'react';

interface ConfidenceGaugeProps {
  confidence: number; // 0.0 to 1.0 or 0 to 100
  size?: number;
  strokeWidth?: number;
}

export const ConfidenceGauge: React.FC<ConfidenceGaugeProps> = ({
  confidence,
  size = 140,
  strokeWidth = 10,
}) => {
  // Normalize to 0 - 100
  const pct = confidence > 1 ? confidence : confidence * 100;
  const clamped = Math.min(100, Math.max(0, pct));

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  // Determine color based on confidence using theme tokens
  let strokeColor = 'var(--sea)';
  if (clamped < 65) strokeColor = 'var(--sand)';
  if (clamped < 45) strokeColor = 'var(--alert)';

  return (
    <div 
      className="relative flex flex-col items-center justify-center shrink-0" 
      style={{ width: size, height: size }}
      role="meter"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`ML Model Confidence: ${clamped.toFixed(1)} percent`}
    >
      <svg width={size} height={size} className="transform -rotate-90" aria-hidden="true">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--line)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-serif text-2xl font-bold tracking-tight text-deep">
          {clamped.toFixed(1)}%
        </span>
        <span className="text-[10px] font-sans font-medium uppercase tracking-wider text-soft">
          ML Confidence
        </span>
      </div>
    </div>
  );
};
