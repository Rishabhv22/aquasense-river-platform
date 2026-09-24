import React from 'react';
import { CheckCircle2, AlertTriangle, Scale, ShieldCheck, Sparkles } from 'lucide-react';

interface ComparisonCardProps {
  cpcbClass: string;
  cpcbCode: string;
  mlClass: string;
  mlCode: string;
  agreement: boolean;
  agreementMessage: string;
  confidence: number;
}

export const ComparisonCard: React.FC<ComparisonCardProps> = ({
  cpcbClass,
  cpcbCode,
  mlClass,
  mlCode,
  agreement,
  agreementMessage,
  confidence,
}) => {
  return (
    <div className={`rounded-3xl p-6 border transition-all ${
      agreement
        ? 'bg-white dark:bg-deep/40 border-line shadow-xs'
        : 'bg-sand/5 dark:bg-sand/10 border-sand/30 shadow-xs'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl ${
            agreement
              ? 'bg-[#e6f3f2] text-sea'
              : 'bg-sand/20 text-sand'
          }`}>
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-semibold text-lg text-deep">
              Regulatory Standard vs ML Prediction
            </h3>
            <p className="text-xs text-soft">
              Statutory deterministic thresholds vs 300-tree Random Forest inference
            </p>
          </div>
        </div>

        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
          agreement
            ? 'bg-[#e6f3f2] text-sea border-sea/30'
            : 'bg-sand/15 text-sand border-sand/40'
        }`}>
          {agreement ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-sea" />
              <span>Consensus Verified</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-sand" />
              <span>Discrepancy Detected</span>
            </>
          )}
        </div>
      </div>

      {/* Side-by-side classification comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* CPCB Card */}
        <div className="p-4 rounded-2xl bg-sky border border-line">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-soft">
              Statutory CPCB Standard
            </span>
            <ShieldCheck className="w-4 h-4 text-sea" />
          </div>
          <div className="text-2xl font-serif font-bold text-deep">
            {cpcbCode}
          </div>
          <p className="text-xs text-mid mt-0.5 line-clamp-1">
            {cpcbClass}
          </p>
          <div className="mt-2 text-[11px] text-soft">
            Determined by DO, BOD, pH, and Fecal Coliform statutory criteria.
          </div>
        </div>

        {/* ML Card */}
        <div className="p-4 rounded-2xl bg-sky border border-line">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-soft">
              Random Forest Model
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sea">
              <Sparkles className="w-3 h-3" />
              {(confidence * 100).toFixed(1)}% Conf.
            </span>
          </div>
          <div className="text-2xl font-serif font-bold text-deep">
            {mlCode}
          </div>
          <p className="text-xs text-mid mt-0.5 line-clamp-1">
            {mlClass}
          </p>
          <div className="mt-2 text-[11px] text-soft">
            Inferred probabilistically across 12 scaled features.
          </div>
        </div>
      </div>

      {/* Explanatory Message */}
      <div className={`p-4 rounded-2xl text-xs leading-relaxed border ${
        agreement
          ? 'bg-[#e6f3f2]/60 text-deep border-sea/20'
          : 'bg-sand/10 text-deep border-sand/30'
      }`}>
        {agreementMessage}
      </div>

      <div className="mt-3 text-[11px] text-soft italic text-right">
        * Model confidence indicates internal ensemble certainty, not regulatory certification.
      </div>
    </div>
  );
};
