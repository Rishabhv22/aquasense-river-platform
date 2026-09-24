import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid,
  Cell
} from 'recharts';
import { useAnalytics } from '../hooks/useAnalytics';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { Cpu } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const {
    distributions,
    correlation,
    modelAnalytics,
    loading,
    error,
    refetch
  } = useAnalytics();

  const [activeDistParam, setActiveDistParam] = useState<'ph' | 'do' | 'bod' | 'conductivity' | 'nitrate' | 'fecal_coliform'>('do');

  const activeDistData = distributions[activeDistParam] || [];

  const paramUnits: Record<string, string> = {
    do: 'mg/L',
    ph: '',
    bod: 'mg/L',
    conductivity: 'µS/cm',
    nitrate: 'mg/L',
    fecal_coliform: 'CFU/100mL'
  };

  const paramLabels: Record<string, string> = {
    do: 'Dissolved Oxygen (DO)',
    ph: 'pH Level',
    bod: 'Biochemical Oxygen Demand (BOD)',
    conductivity: 'Electrical Conductivity',
    nitrate: 'Nitrate (NO₃)',
    fecal_coliform: 'Fecal Coliform'
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Header */}
      <div className="border-b border-line pb-6">
        <span className="text-[11px] font-semibold text-soft uppercase tracking-wider block mb-1">
          Analytics Workspace
        </span>
        <h1 className="font-sans text-3xl sm:text-4xl font-bold text-deep tracking-tight">
          Environmental Analytics &amp; Model Performance
        </h1>
        <p className="text-sm text-soft mt-1 max-w-2xl">
          Statistical parameter distributions, Pearson correlation matrices, and verified Scikit-learn Random Forest model evaluations.
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white dark:bg-[#10252e] border border-line p-12 shadow-subtle">
          <LoadingState message="Loading statistical benchmarks and model analytics..." />
        </div>
      ) : error ? (
        <ErrorState
          title="Analytics Unavailable"
          message={error}
          onRetry={refetch}
        />
      ) : (
        <>
          {/* Section 1: Model Performance & Architecture */}
          {modelAnalytics && (
            <div className="bg-white dark:bg-[#10252e] border border-line rounded-2xl p-6 shadow-subtle space-y-6">
              <div className="border-b border-line pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-soft block">
                    Machine Learning Architecture
                  </span>
                  <h2 className="font-sans text-xl font-bold text-deep mt-0.5 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-sea" />
                    <span>Verified Random Forest Architecture</span>
                  </h2>
                  <p className="text-xs text-soft mt-0.5">
                    {modelAnalytics.n_estimators} Estimators &bull; Max Depth {modelAnalytics.max_depth} &bull; {modelAnalytics.n_features} Scaled Input Features &bull; Stratified Split
                  </p>
                </div>
                <span className="text-xs text-soft font-mono">
                  {modelAnalytics.dataset_records.toLocaleString()} Records
                </span>
              </div>

              {/* 4 Clean Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-sky/60 dark:bg-white/5 border border-line">
                  <span className="text-[10px] text-soft font-semibold uppercase tracking-wider block">Train Accuracy</span>
                  <strong className="font-sans text-3xl font-bold text-deep block mt-1">
                    {(modelAnalytics.evaluation_metrics.train_accuracy * 100).toFixed(1)}%
                  </strong>
                  <span className="text-[11px] text-soft mt-1 block">Zero-leakage training split</span>
                </div>

                <div className="p-4 rounded-xl bg-sky/60 dark:bg-white/5 border border-line">
                  <span className="text-[10px] text-soft font-semibold uppercase tracking-wider block">Test Set Accuracy</span>
                  <strong className="font-sans text-3xl font-bold text-sea block mt-1">
                    {(modelAnalytics.evaluation_metrics.test_accuracy * 100).toFixed(1)}%
                  </strong>
                  <span className="text-[11px] text-sea/80 mt-1 block font-medium">Verified test partition</span>
                </div>

                <div className="p-4 rounded-xl bg-sky/60 dark:bg-white/5 border border-line">
                  <span className="text-[10px] text-soft font-semibold uppercase tracking-wider block">5-Fold CV Score</span>
                  <strong className="font-sans text-3xl font-bold text-deep block mt-1">
                    {(modelAnalytics.evaluation_metrics.five_fold_cv_mean * 100).toFixed(1)}%
                  </strong>
                  <span className="text-[11px] text-soft mt-1 block">Cross-validation mean</span>
                </div>

                <div className="p-4 rounded-xl bg-sky/60 dark:bg-white/5 border border-line">
                  <span className="text-[10px] text-soft font-semibold uppercase tracking-wider block">Test Split Ratio</span>
                  <strong className="font-sans text-3xl font-bold text-deep block mt-1">
                    {(modelAnalytics.evaluation_metrics.test_split_ratio * 100).toFixed(0)}%
                  </strong>
                  <span className="text-[11px] text-soft mt-1 block">Stratified holdout partition</span>
                </div>
              </div>

              {/* Features Used in Ensemble */}
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-soft uppercase tracking-wider block mb-3">
                  12 Input &amp; Engineered Features
                </span>
                <div className="flex flex-wrap gap-2">
                  {modelAnalytics.features_used.map((feat) => (
                    <span 
                      key={feat}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono bg-sky dark:bg-white/10 text-mid border border-line"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Parameter Distribution Histograms */}
          <div className="bg-white dark:bg-[#10252e] border border-line rounded-2xl p-6 shadow-subtle space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-soft block">
                  Empirical Distribution
                </span>
                <h2 className="font-sans text-xl font-bold text-deep mt-0.5">
                  {paramLabels[activeDistParam]} Observation Histogram
                </h2>
                <p className="text-xs text-soft mt-0.5">
                  Binned frequency distribution across 1,864 historical monitoring records
                </p>
              </div>

              {/* Parameter Tabs */}
              <div className="flex flex-wrap gap-1 bg-sky dark:bg-white/10 p-1 rounded-xl border border-line text-xs">
                {(['do', 'bod', 'ph', 'conductivity', 'nitrate', 'fecal_coliform'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setActiveDistParam(p)}
                    className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                      activeDistParam === p 
                        ? 'bg-white dark:bg-[#10252e] text-deep shadow-2xs font-semibold' 
                        : 'text-soft hover:text-deep'
                    }`}
                  >
                    {p.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeDistData} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" vertical={false} />
                  <XAxis 
                    dataKey="bin" 
                    stroke="var(--color-soft)" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="var(--color-soft)" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-white dark:bg-[#10252e] border border-line rounded-xl p-3 shadow-elevated text-xs space-y-0.5">
                            <span className="font-bold text-deep">Range: {d.bin} {paramUnits[activeDistParam]}</span>
                            <div className="text-sea font-semibold">{d.count} records ({d.percentage.toFixed(1)}%)</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {activeDistData.map((_entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index % 2 === 0 ? 'var(--color-sea)' : 'rgba(2, 132, 199, 0.75)'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Section 3: Pearson Correlation Matrix */}
          {correlation && (
            <div className="bg-white dark:bg-[#10252e] border border-line rounded-2xl p-6 shadow-subtle space-y-4">
              <div className="border-b border-line pb-4">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-soft block">
                  Bivariate Relationships
                </span>
                <h2 className="font-sans text-xl font-bold text-deep mt-0.5">
                  Pearson Correlation Matrix
                </h2>
                <p className="text-xs text-soft mt-0.5">
                  Pairwise linear correlation coefficients across all 6 core physical-chemical parameters
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-line text-soft font-semibold uppercase text-[10px]">
                      <th className="py-2.5 px-3 text-left">Parameter</th>
                      {correlation.columns.map((v) => (
                        <th key={v} className="py-2.5 px-3 font-mono">{v.toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60">
                    {correlation.columns.map((rowVar) => (
                      <tr key={rowVar} className="hover:bg-sky/50 dark:hover:bg-white/5 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-deep text-left uppercase text-[11px]">
                          {rowVar}
                        </td>
                        {correlation.columns.map((colVar) => {
                          const val = correlation.matrix[rowVar]?.[colVar] ?? 0;
                          const isSelf = rowVar === colVar;
                          let bg = 'text-soft';
                          if (!isSelf) {
                            if (val > 0.4) bg = 'text-sea font-semibold';
                            else if (val < -0.4) bg = 'text-alert font-semibold';
                            else bg = 'text-mid font-mono';
                          }
                          return (
                            <td key={colVar} className={`py-2 px-3 font-mono text-xs ${bg}`}>
                              {val.toFixed(2)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-3 text-[11px] text-soft italic border-t border-line/60">
                Values range from -1.0 (inverse correlation) to +1.0 (direct correlation). Notable inverse correlation exists between Dissolved Oxygen and organic Biochemical Oxygen Demand.
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
