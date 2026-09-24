import React from 'react';
import { Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';

interface InsightsPanelProps {
  insights: string[];
  warnings: string[];
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ insights, warnings }) => {
  return (
    <div className="rounded-3xl bg-white dark:bg-deep/40 border border-line p-6 shadow-xs">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 rounded-2xl bg-[#e6f3f2] text-sea">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-serif font-semibold text-lg text-deep">
            Automated Environmental Insights
          </h3>
          <p className="text-xs text-soft">
            Algorithmic interpretation of physical-chemical interactions and biological impact
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Compliant Observations */}
        {insights.length > 0 && (
          <div className="space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-sea flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Compliant Factors</span>
            </div>
            <ul className="space-y-1.5 list-none p-0 m-0">
              {insights.map((insight, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-deep bg-[#e6f3f2]/40 dark:bg-sea/10 p-3 rounded-2xl border border-sea/20 leading-relaxed"
                >
                  <span className="text-sea font-bold shrink-0 mt-0.5">✓</span>
                  <span>{insight.replace(/^✓\s*/, '')}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Environmental Warnings */}
        {warnings.length > 0 && (
          <div className="space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-alert flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Environmental Alerts &amp; Discrepancies</span>
            </div>
            <ul className="space-y-1.5 list-none p-0 m-0">
              {warnings.map((warning, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-deep bg-alert/5 p-3 rounded-2xl border border-alert/25 leading-relaxed"
                >
                  <span className="text-alert font-bold shrink-0 mt-0.5">⚠</span>
                  <span>{warning.replace(/^⚠\s*/, '')}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
