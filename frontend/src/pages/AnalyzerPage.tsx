import React, { useState } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  Sliders, 
  AlertCircle, 
  GitCompare, 
  Download, 
  ShieldCheck, 
  ChevronDown,
  ChevronUp,
  Scale
} from 'lucide-react';
import { ParameterSlider } from '../components/ParameterSlider';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { Modal } from '../components/common/Modal';
import { usePrediction } from '../hooks/usePrediction';
import { WaterParameters } from '../types';
import { downloadJsonReport, printAssessmentReport } from '../utils/reportExport';

interface AnalyzerPageProps {
  initialParams?: WaterParameters;
  onSelectStation?: () => void;
}

export const AnalyzerPage: React.FC<AnalyzerPageProps> = ({ initialParams, onSelectStation }) => {
  const {
    paramsA,
    paramsB,
    mode,
    setMode,
    resultA,
    loadingA,
    loadingB,
    errorA,
    errorB,
    metadata,
    updateParamA,
    updateParamB,
    applyPresetA,
    applyPresetB,
    analyzeA,
    analyzeB,
    validationErrorsA,
    validationErrorsB
  } = usePrediction(initialParams);

  const [showExportModal, setShowExportModal] = useState(false);
  const [showEngineeredFeatures, setShowEngineeredFeatures] = useState(false);
  const [activeTab, setActiveTab] = useState<'sampleA' | 'sampleB'>('sampleA');

  // Active parameter preset options from backend metadata or fallback
  const presets = metadata?.presets || [
    {
      id: 'class_a',
      label: 'Class A: Pristine Stream',
      description: 'Drinking source without treatment; high oxygen, minimal organic pollutants',
      category: 'class_preset' as const,
      values: { temperature: 21.0, do: 8.2, ph: 7.3, conductivity: 180.0, bod: 1.1, nitrate: 0.8, fecal_coliform: 20.0 }
    },
    {
      id: 'class_b',
      label: 'Class B: Clean River Bathing',
      description: 'Safe for organized outdoor bathing and contact recreation',
      category: 'class_preset' as const,
      values: { temperature: 25.0, do: 6.8, ph: 7.4, conductivity: 450.0, bod: 2.5, nitrate: 1.8, fecal_coliform: 160.0 }
    },
    {
      id: 'class_c',
      label: 'Class C: Agricultural Runoff',
      description: 'Moderate nutrient and bacterial loading; requires conventional treatment',
      category: 'class_preset' as const,
      values: { temperature: 27.0, do: 4.8, ph: 6.9, conductivity: 850.0, bod: 3.2, nitrate: 8.5, fecal_coliform: 1400.0 }
    },
    {
      id: 'class_de',
      label: 'Class D/E: Severely Polluted',
      description: 'Low oxygen, elevated BOD and untreated sewage bacteria',
      category: 'class_preset' as const,
      values: { temperature: 31.0, do: 2.4, ph: 6.2, conductivity: 1750.0, bod: 12.0, nitrate: 16.5, fecal_coliform: 12000.0 }
    }
  ];

  // Helper badge evaluators for real-time guidance
  const getBadge = (param: keyof WaterParameters, val: number) => {
    switch (param) {
      case 'do':
        if (val >= 6.5) return { text: 'Class A/B Healthy', variant: 'healthy' as const };
        if (val >= 5.0) return { text: 'Class B Bathing', variant: 'normal' as const };
        if (val >= 4.0) return { text: 'Class C/D Marg.', variant: 'moderate' as const };
        return { text: 'Hypoxic (< 4 mg/L)', variant: 'critical' as const };
      case 'ph':
        if (val >= 6.8 && val <= 7.8) return { text: 'Optimal Neutral', variant: 'healthy' as const };
        if (val >= 6.5 && val <= 8.5) return { text: 'Regulatory Safe', variant: 'normal' as const };
        if (val >= 6.0 && val <= 9.0) return { text: 'Moderate Range', variant: 'moderate' as const };
        return { text: 'Extreme pH', variant: 'critical' as const };
      case 'bod':
        if (val <= 2.0) return { text: 'Class A (≤ 2.0)', variant: 'healthy' as const };
        if (val <= 3.0) return { text: 'Class B (≤ 3.0)', variant: 'normal' as const };
        if (val <= 6.0) return { text: 'Elevated Organic', variant: 'warning' as const };
        return { text: 'Severe Sewage', variant: 'critical' as const };
      case 'conductivity':
        if (val <= 400) return { text: 'Low Mineral', variant: 'healthy' as const };
        if (val <= 1000) return { text: 'Normal Fresh', variant: 'normal' as const };
        if (val <= 2000) return { text: 'Elevated Salts', variant: 'moderate' as const };
        return { text: 'High Salinity', variant: 'warning' as const };
      case 'nitrate':
        if (val <= 2.0) return { text: 'Safe Baseline', variant: 'healthy' as const };
        if (val <= 10.0) return { text: 'Standard Runoff', variant: 'normal' as const };
        if (val <= 45.0) return { text: 'Near Limit (45)', variant: 'warning' as const };
        return { text: 'Toxic Potable', variant: 'critical' as const };
      case 'fecal_coliform':
        if (val <= 50) return { text: 'Class A (≤ 50)', variant: 'healthy' as const };
        if (val <= 500) return { text: 'Class B (≤ 500)', variant: 'normal' as const };
        if (val <= 5000) return { text: 'Class C (≤ 5000)', variant: 'moderate' as const };
        return { text: 'Contaminated', variant: 'critical' as const };
      case 'temperature':
      default:
        if (val >= 18 && val <= 28) return { text: 'Optimal Biology', variant: 'healthy' as const };
        if (val >= 15 && val <= 32) return { text: 'Ambient Seasonal', variant: 'normal' as const };
        return { text: 'Extreme Temp', variant: 'warning' as const };
    }
  };

  const renderParameterSliders = (
    currentParams: WaterParameters,
    onParamChange: (k: keyof WaterParameters, v: number) => void,
    onReset: () => void,
    errors: { key: keyof WaterParameters; message: string }[]
  ) => (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-sea" />
          <span className="font-semibold text-xs text-deep uppercase tracking-wider">
            7 Measured Physical-Chemical Parameters
          </span>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="p-1.5 rounded-lg text-soft hover:text-deep hover:bg-sky dark:hover:bg-white/10 transition-colors cursor-pointer"
          title="Reset to benchmark defaults"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {errors.length > 0 && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800/40 text-deep text-xs space-y-1">
          <div className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Parameter Guidance Warnings</span>
          </div>
          <ul className="list-disc pl-4 space-y-0.5 text-soft">
            {errors.map((e, idx) => (
              <li key={idx}>{e.message}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-2.5">
        <ParameterSlider
          label="Temperature"
          name="temperature"
          value={currentParams.temperature}
          unit="°C"
          min={0}
          max={45}
          step={0.1}
          recommendedRange="15 – 30 °C"
          guidance="Controls gas solubility and biological metabolism."
          statusBadge={getBadge('temperature', currentParams.temperature)}
          onChange={(val) => onParamChange('temperature', val)}
        />

        <ParameterSlider
          label="Dissolved Oxygen (DO)"
          name="do"
          value={currentParams.do}
          unit="mg/L"
          min={0}
          max={14}
          step={0.1}
          recommendedRange="≥ 6.0 (Class A), ≥ 5.0 (Class B)"
          guidance="Vital for aquatic respiration; below 4.0 mg/L indicates hypoxia."
          statusBadge={getBadge('do', currentParams.do)}
          onChange={(val) => onParamChange('do', val)}
        />

        <ParameterSlider
          label="pH Level"
          name="ph"
          value={currentParams.ph}
          unit=""
          min={0}
          max={14}
          step={0.1}
          recommendedRange="6.5 – 8.5"
          guidance="Chemical neutrality baseline; standard safe range is 6.5–8.5."
          statusBadge={getBadge('ph', currentParams.ph)}
          onChange={(val) => onParamChange('ph', val)}
        />

        <ParameterSlider
          label="Electrical Conductivity"
          name="conductivity"
          value={currentParams.conductivity}
          unit="µS/cm"
          min={0}
          max={3000}
          step={10}
          recommendedRange="0 – 1,000 µS/cm"
          guidance="Total dissolved ionic solids and mineral salt content."
          statusBadge={getBadge('conductivity', currentParams.conductivity)}
          onChange={(val) => onParamChange('conductivity', val)}
        />

        <ParameterSlider
          label="Biochemical Oxygen Demand (BOD)"
          name="bod"
          value={currentParams.bod}
          unit="mg/L"
          min={0}
          max={30}
          step={0.1}
          recommendedRange="≤ 2.0 (Class A), ≤ 3.0 (Class B)"
          guidance="Organic load proxy; values > 6.0 indicate untreated sewage."
          statusBadge={getBadge('bod', currentParams.bod)}
          onChange={(val) => onParamChange('bod', val)}
        />

        <ParameterSlider
          label="Nitrate (NO₃)"
          name="nitrate"
          value={currentParams.nitrate}
          unit="mg/L"
          min={0}
          max={50}
          step={0.1}
          recommendedRange="0 – 10 mg/L (WHO Max: 45)"
          guidance="Nutrient and fertilizer runoff indicator."
          statusBadge={getBadge('nitrate', currentParams.nitrate)}
          onChange={(val) => onParamChange('nitrate', val)}
        />

        <ParameterSlider
          label="Fecal Coliform"
          name="fecal_coliform"
          value={currentParams.fecal_coliform}
          unit="CFU/100mL"
          min={0}
          max={20000}
          step={10}
          recommendedRange="≤ 50 (Class A), ≤ 500 (Class B)"
          guidance="Pathogenic bacterial density indicating sewage discharge."
          statusBadge={getBadge('fecal_coliform', currentParams.fecal_coliform)}
          onChange={(val) => onParamChange('fecal_coliform', val)}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="border-b border-line pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold text-soft uppercase tracking-wider block mb-1">
            Diagnostic Inference Engine
          </span>
          <h1 className="font-sans text-3xl sm:text-4xl font-bold text-deep tracking-tight">
            Analyze Water Quality
          </h1>
          <p className="text-sm text-soft mt-1 max-w-2xl">
            Enter measured water parameters to generate an authoritative CPCB regulatory compliance assessment and Random Forest prediction.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setMode(mode === 'single' ? 'compare' : 'single')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
              mode === 'compare'
                ? 'bg-sea text-white border-transparent shadow-subtle'
                : 'bg-white dark:bg-[#10252e] border-line text-mid hover:text-deep hover:border-sea/40'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>{mode === 'compare' ? 'Exit Compare Mode' : 'Compare Two Samples'}</span>
          </button>

          {resultA && (
            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-white dark:bg-[#10252e] border border-line text-mid hover:text-deep transition-all cursor-pointer shadow-subtle"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Presets Bar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-[#10252e] border border-line shadow-subtle flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-semibold text-soft uppercase tracking-wider pl-1">
            Presets:
          </span>
          {presets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                if (activeTab === 'sampleA') applyPresetA(p.values);
                else applyPresetB(p.values);
              }}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-sky/60 dark:bg-white/5 border border-line text-mid hover:text-deep hover:border-sea/40 transition-all cursor-pointer"
              title={p.description}
            >
              {p.label}
            </button>
          ))}
          {onSelectStation && (
            <button
              type="button"
              onClick={onSelectStation}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-sea/10 border border-sea/25 text-sea hover:bg-sea/20 transition-all cursor-pointer"
              title="Select a monitoring station to load its water quality parameters"
            >
              Load from Station...
            </button>
          )}
        </div>

        <div className="text-[11px] text-soft italic hidden xl:inline pr-2">
          Click any preset to auto-populate certified benchmark parameters.
        </div>
      </div>

      {/* 2-Column Interface: Left Input, Right Analytical Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Parameter Controls */}
        <div className="lg:col-span-5 bg-white dark:bg-[#10252e] border border-line rounded-2xl p-6 shadow-subtle space-y-6">
          {mode === 'compare' && (
            <div className="flex rounded-xl bg-sky dark:bg-white/10 p-1 border border-line">
              <button
                type="button"
                onClick={() => setActiveTab('sampleA')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'sampleA' ? 'bg-white dark:bg-[#10252e] text-deep shadow-2xs' : 'text-soft hover:text-deep'
                }`}
              >
                Sample A (Baseline)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('sampleB')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'sampleB' ? 'bg-white dark:bg-[#0f172a] text-deep shadow-2xs' : 'text-soft hover:text-deep'
                }`}
              >
                Sample B (Comparison)
              </button>
            </div>
          )}

          {activeTab === 'sampleA' ? (
            <>
              {renderParameterSliders(
                paramsA,
                updateParamA,
                () => applyPresetA(presets[1].values),
                validationErrorsA
              )}

              {/* PRIMARY CTA: Analyze Water Quality (Sample A) */}
              <button
                type="button"
                onClick={() => analyzeA(paramsA)}
                disabled={loadingA}
                className="w-full py-3.5 px-6 rounded-xl bg-sea text-white font-semibold text-xs tracking-wide uppercase shadow-subtle hover:bg-sea/90 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>{loadingA ? 'Analyzing Parameters...' : 'Analyze Water Quality (Sample A)'}</span>
              </button>
            </>
          ) : (
            <>
              {renderParameterSliders(
                paramsB,
                updateParamB,
                () => applyPresetB(presets[2].values),
                validationErrorsB
              )}

              {/* PRIMARY CTA: Analyze Water Quality (Sample B) */}
              <button
                type="button"
                onClick={() => analyzeB(paramsB)}
                disabled={loadingB}
                className="w-full py-3.5 px-6 rounded-xl bg-sea text-white font-semibold text-xs tracking-wide uppercase shadow-subtle hover:bg-sea/90 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>{loadingB ? 'Analyzing Parameters...' : 'Analyze Water Quality (Sample B)'}</span>
              </button>
            </>
          )}
        </div>

        {/* RIGHT COLUMN: Results & Insights */}
        <div className="lg:col-span-7 space-y-6">
          {loadingA && !resultA ? (
            <div className="rounded-2xl bg-white dark:bg-[#10252e] border border-line p-12 shadow-subtle">
              <LoadingState message="Connecting to AquaSense model inference service..." />
            </div>
          ) : (errorA || (mode === 'compare' && errorB)) ? (
            <ErrorState
              title="Analysis Service Notice"
              message={errorA || errorB || 'Unable to complete analysis.'}
              onRetry={() => {
                if (errorA) analyzeA(paramsA);
                if (errorB) analyzeB(paramsB);
              }}
            />
          ) : resultA ? (
            <>
              {/* Hero Result Card (Apple SaaS Report Header) */}
              <div className="rounded-2xl bg-white dark:bg-[#10252e] border border-line p-6 shadow-subtle">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-5">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-soft block mb-1">
                      Statutory Assessment &bull; Primary Designated Use
                    </span>
                    <h2 className="font-sans text-3xl sm:text-4xl font-bold text-deep tracking-tight mt-1">
                      {resultA.cpcb_code}
                    </h2>
                    <p className="text-sm text-mid mt-1">
                      {resultA.cpcb_class}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 sm:text-right shrink-0">
                    <div className="p-3 rounded-xl bg-sky/60 dark:bg-white/5 border border-line">
                      <span className="text-[10px] uppercase font-semibold text-soft block">
                        Model Confidence
                      </span>
                      <strong className="text-xl font-bold text-deep block">
                        {(resultA.confidence * 100).toFixed(1)}%
                      </strong>
                    </div>

                    <div className="p-3 rounded-xl bg-sky/60 dark:bg-white/5 border border-line">
                      <span className="text-[10px] uppercase font-semibold text-soft block">
                        WQI Index
                      </span>
                      <strong className="text-xl font-bold text-sea block">
                        {resultA.water_quality_indicator.toFixed(0)} <span className="text-xs font-normal text-soft">/ 100</span>
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Limiting Factor Callout */}
                {resultA.limiting_factor && (
                  <div className="mt-4 p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/25 border border-amber-200/50 dark:border-amber-800/30 flex items-start gap-2.5 text-xs text-deep">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-amber-800 dark:text-amber-300">Regulatory Limiting Factor: </span>
                      <span className="text-mid">{resultA.limiting_factor}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Clean Horizontal Comparison: CPCB Standard vs ML Prediction */}
              <div className="rounded-2xl bg-white dark:bg-[#10252e] border border-line p-6 shadow-subtle space-y-4">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-sea" />
                    <span className="text-xs font-semibold text-deep uppercase tracking-wider">
                      Regulatory Standard vs Machine Learning
                    </span>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                    resultA.agreement
                      ? 'bg-sea/10 text-sea border-sea/25'
                      : 'bg-sand/15 text-[#9c7627] dark:text-sand border-sand/30'
                  }`}>
                    {resultA.agreement ? 'Consensus Match' : 'Discrepancy Detected'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-sky/60 dark:bg-white/5 border border-line">
                    <span className="text-soft text-[10px] uppercase font-semibold block">Regulatory Assessment</span>
                    <strong className="text-base font-bold text-deep block mt-0.5">
                      {resultA.cpcb_class}
                    </strong>
                    <span className="text-[11px] text-mid mt-0.5 block">Statutory CPCB rules</span>
                  </div>

                  <div className="p-3 rounded-xl bg-sky/60 dark:bg-white/5 border border-line">
                    <span className="text-soft text-[10px] uppercase font-semibold block">Machine Learning</span>
                    <strong className="text-base font-bold text-deep block mt-0.5">
                      {resultA.ml_class}
                    </strong>
                    <span className="text-[11px] text-mid mt-0.5 block">Random Forest (300 trees)</span>
                  </div>

                  <div className="p-3 rounded-xl bg-sky/60 dark:bg-white/5 border border-line">
                    <span className="text-soft text-[10px] uppercase font-semibold block">System Consensus</span>
                    <strong className="text-base font-bold text-deep block mt-0.5">
                      {resultA.agreement ? 'Agreement' : 'Class Divergence'}
                    </strong>
                    <span className="text-[11px] text-mid mt-0.5 block">
                      {resultA.agreement ? 'Full harmony' : 'Near threshold'}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-soft leading-relaxed">
                  CPCB statutory classification operates deterministically on established threshold standards. The Random Forest model evaluates multi-dimensional non-linear interactions across 12 scaled features.
                </p>
              </div>

              {/* Parameter Analysis Breakdown */}
              <div className="rounded-2xl bg-white dark:bg-[#10252e] border border-line p-6 shadow-subtle space-y-4">
                <div className="border-b border-line pb-3 flex items-center justify-between">
                  <h3 className="font-sans text-sm font-bold text-deep uppercase tracking-wider">
                    Parameter Analysis
                  </h3>
                  <span className="text-xs text-soft">
                    Observed vs Standard Benchmarks
                  </span>
                </div>

                <div className="divide-y divide-line/60">
                  {resultA.parameters_analysis.map((p) => {
                    const isGood = p.score >= 70;
                    const isWarning = p.score >= 40 && p.score < 70;
                    return (
                      <div key={p.key} className="py-2.5 flex items-center justify-between text-xs gap-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            isGood ? 'bg-emerald-500' : isWarning ? 'bg-amber-500' : 'bg-rose-500'
                          }`} />
                          <span className="font-medium text-deep">{p.name}</span>
                          <span className="text-soft text-[11px]">
                            ({p.value} {p.unit})
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`font-medium ${
                            isGood ? 'text-emerald-600 dark:text-emerald-400' : isWarning ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
                          }`}>
                            {p.status}
                          </span>
                          <span className="font-mono text-soft text-[11px]">
                            {p.score.toFixed(0)}/100
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Model Explainability: WHY THIS RESULT? */}
              <div className="rounded-2xl bg-white dark:bg-[#10252e] border border-line p-6 shadow-subtle space-y-4">
                <div className="border-b border-line pb-3">
                  <span className="text-[10px] font-semibold text-soft uppercase tracking-wider block">
                    Model Explainability
                  </span>
                  <h3 className="font-sans text-sm font-bold text-deep uppercase tracking-wider mt-0.5">
                    Why This Result?
                  </h3>
                  <p className="text-xs text-soft mt-0.5">
                    Feature importance contributing to Random Forest tree splits for this assessment
                  </p>
                </div>

                <div className="space-y-3">
                  {resultA.feature_importance.slice(0, 5).map((f) => (
                    <div key={f.feature} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-deep">{f.label}</span>
                        <span className="font-mono text-soft">{f.percentage.toFixed(1)}% weight</span>
                      </div>
                      <div className="w-full h-1.5 bg-sky dark:bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-sea rounded-full"
                          style={{ width: `${Math.min(100, Math.max(5, f.percentage * 2.5))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 text-xs text-soft leading-relaxed border-t border-line/60">
                  The model places the greatest importance on <strong className="text-deep">{resultA.feature_importance[0]?.label}</strong> and <strong className="text-deep">{resultA.feature_importance[1]?.label}</strong> for this prediction.
                </div>
              </div>

              {/* Actionable Ecological Guidance */}
              {resultA.insights && resultA.insights.length > 0 && (
                <div className="rounded-2xl bg-white dark:bg-[#10252e] border border-line p-6 shadow-subtle space-y-3">
                  <div className="flex items-center gap-2 border-b border-line pb-3">
                    <ShieldCheck className="w-4 h-4 text-sea" />
                    <h3 className="font-sans text-sm font-bold text-deep uppercase tracking-wider">
                      Targeted Remediation Guidance
                    </h3>
                  </div>
                  <ul className="space-y-2 text-xs">
                    {resultA.insights.map((ins, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-sky/60 dark:bg-white/5 border border-line/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-sea shrink-0 mt-1.5" />
                        <span className="text-deep leading-relaxed text-[12px]">{ins}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Engineered Diagnostic Features (Collapsible) */}
              <div className="rounded-2xl bg-white dark:bg-[#10252e] border border-line p-5 shadow-subtle">
                <button
                  type="button"
                  onClick={() => setShowEngineeredFeatures(!showEngineeredFeatures)}
                  className="w-full flex items-center justify-between text-xs text-mid hover:text-deep transition-colors cursor-pointer"
                >
                  <span className="font-medium">Synthesized Machine Learning Features (DO/BOD, Pollution Index)</span>
                  {showEngineeredFeatures ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showEngineeredFeatures && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mt-3 border-t border-line text-xs font-mono">
                    <div className="p-3 rounded-xl bg-sky/60 dark:bg-white/5 border border-line">
                      <span className="text-[10px] text-soft block">DO/BOD Ratio</span>
                      <strong className="text-sm text-deep">{resultA.engineered_features.do_bod_ratio.toFixed(2)}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-sky/60 dark:bg-white/5 border border-line">
                      <span className="text-[10px] text-soft block">Pollution Index</span>
                      <strong className="text-sm text-deep">{resultA.engineered_features.pollution_index.toFixed(2)}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-sky/60 dark:bg-white/5 border border-line">
                      <span className="text-[10px] text-soft block">pH Deviation</span>
                      <strong className="text-sm text-deep">{resultA.engineered_features.ph_deviation.toFixed(2)}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-sky/60 dark:bg-white/5 border border-line">
                      <span className="text-[10px] text-soft block">Log Conductivity</span>
                      <strong className="text-sm text-deep">{resultA.engineered_features.conductivity_log.toFixed(2)}</strong>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Export Report Modal */}
      {showExportModal && resultA && (
        <Modal 
          isOpen={showExportModal} 
          onClose={() => setShowExportModal(false)}
          title="Export Water Quality Assessment Report"
        >
          <div className="space-y-4 text-xs">
            <p className="text-soft">
              Download the authoritative CPCB regulatory assessment, Random Forest prediction, and input parameter observations.
            </p>

            <div className="p-4 rounded-xl bg-sky/60 dark:bg-white/5 border border-line space-y-2">
              <div className="flex justify-between">
                <span className="text-soft">CPCB Classification:</span>
                <strong className="text-deep">{resultA.cpcb_code} ({resultA.cpcb_class})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-soft">Machine Learning Code:</span>
                <strong className="text-deep">{resultA.ml_code} ({resultA.ml_class})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-soft">WQI Index:</span>
                <strong className="text-sea">{resultA.water_quality_indicator.toFixed(0)} / 100</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-soft">Model Confidence:</span>
                <strong className="text-deep">{(resultA.confidence * 100).toFixed(1)}%</strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
              <button
                type="button"
                onClick={() => printAssessmentReport(paramsA, resultA)}
                className="px-4 py-2 rounded-xl border border-line bg-white dark:bg-white/5 text-deep hover:bg-sky/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                Print Assessment Report
              </button>
              <button
                type="button"
                onClick={() => {
                  downloadJsonReport(paramsA, resultA);
                  setShowExportModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-sea text-white hover:bg-sea/90 transition-colors cursor-pointer"
              >
                Download JSON Data
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
