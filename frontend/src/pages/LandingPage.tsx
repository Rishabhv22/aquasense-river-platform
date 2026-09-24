import React from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Sparkles, 
  Radio, 
  Activity, 
  Database, 
  CheckCircle2, 
  BarChart2, 
  Layers
} from 'lucide-react';
import { PageId } from '../types';

interface LandingPageProps {
  onNavigate: (page: PageId) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const trustBadges = [
    { title: 'CPCB Standards', desc: 'Central Pollution Control Board Regulatory Classes A–E', icon: <ShieldCheck className="w-5 h-5 text-emerald-500" /> },
    { title: 'Random Forest ML', desc: '300-estimator ensemble with 98.57% test accuracy', icon: <Cpu className="w-5 h-5 text-brand-500" /> },
    { title: 'Explainable AI', desc: 'Real-time Gini feature importance & transparent rules', icon: <Sparkles className="w-5 h-5 text-amber-500" /> },
    { title: 'Real-Time Analysis', desc: 'Instant multi-parameter physical-chemical inference', icon: <Radio className="w-5 h-5 text-cyan-500" /> },
  ];

  const statCounters = [
    { label: 'Dataset Records', value: '1,868', sub: 'Historical CPCB Samples' },
    { label: 'Major Rivers', value: '6 Basins', sub: 'Godavari, Narmada, Yamuna, etc.' },
    { label: 'Monitoring Stations', value: '315', sub: 'Calibrated Station Network' },
    { label: 'ML Test Accuracy', value: '98.57%', sub: 'Verified in train_model.ipynb' },
  ];

  const features = [
    {
      title: 'Hybrid Classification',
      desc: 'Combines deterministic CPCB regulatory rules with non-linear machine learning to detect subtle pollution signals.',
      icon: <Layers className="w-6 h-6 text-brand-500" />,
      action: 'analyze' as PageId,
      actionText: 'Try Analyzer'
    },
    {
      title: 'Historical Exploration',
      desc: 'Explore 11 years (2013–2023) of real river records across Gujarat, Maharashtra, MP, Odisha, and AP.',
      icon: <Database className="w-6 h-6 text-emerald-500" />,
      action: 'historical' as PageId,
      actionText: 'Browse Records'
    },
    {
      title: 'Advanced Analytics',
      desc: 'Examine parameter correlations, density distributions, class breakdown, and verified model performance metrics.',
      icon: <BarChart2 className="w-6 h-6 text-cyan-500" />,
      action: 'analytics' as PageId,
      actionText: 'View Analytics'
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-brand-900 via-[#0a213e] to-[#071324] text-white p-8 sm:p-12 lg:p-16 shadow-2xl border border-brand-800/40">
        {/* Abstract Water Waves & Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/20 border border-brand-400/30 text-cyan-300 text-xs font-semibold backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </span>
            <span>Intelligent Environmental Decision Support System</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            River Water Quality <br />
            <span className="bg-gradient-to-r from-cyan-300 via-teal-200 to-sky-400 bg-clip-text text-transparent">
              Analysis & Forecasting
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
            AI-powered water quality assessment combining Central Pollution Control Board (CPCB) regulatory standards with machine learning for faster, explainable environmental monitoring.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('analyze')}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-cyan-500 hover:from-brand-600 hover:to-cyan-600 text-white font-bold text-sm shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <span>Analyze Water Quality</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('overview')}
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/20 backdrop-blur-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <span>Explore Dashboard</span>
            </button>
          </div>
        </div>

        {/* Floating Mini-Telemetry Card */}
        <div className="mt-10 lg:mt-0 lg:absolute lg:right-12 lg:top-1/2 lg:-translate-y-1/2 w-full lg:w-80 p-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Live Sensor Preview
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
              Class B
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
              <div className="text-slate-400 text-[10px]">Dissolved O₂</div>
              <div className="text-base font-bold text-cyan-300">7.2 mg/L</div>
              <div className="text-[10px] text-emerald-400">Healthy</div>
            </div>
            <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
              <div className="text-slate-400 text-[10px]">pH Level</div>
              <div className="text-base font-bold text-white">7.4</div>
              <div className="text-[10px] text-emerald-400">Normal</div>
            </div>
            <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
              <div className="text-slate-400 text-[10px]">BOD</div>
              <div className="text-base font-bold text-white">2.8 mg/L</div>
              <div className="text-[10px] text-amber-300">Moderate</div>
            </div>
            <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
              <div className="text-slate-400 text-[10px]">ML Confidence</div>
              <div className="text-base font-bold text-emerald-300">94.2%</div>
              <div className="text-[10px] text-slate-300">300 Trees</div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {trustBadges.map((badge, idx) => (
          <div key={idx} className="glass-panel rounded-2xl p-5 flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 shrink-0">
              {badge.icon}
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {badge.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {badge.desc}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* Stat Counters */}
      <section className="glass-panel rounded-3xl p-8">
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Real Environmental Intelligence
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Calibrated on official multi-river surveillance datasets compiled across Indian river basins
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {statCounters.map((stat, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50">
              <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-brand-600 to-cyan-500 bg-clip-text text-transparent dark:from-brand-400 dark:to-cyan-300">
                {stat.value}
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                {stat.label}
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                {stat.sub}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Platform Modules
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              Engineered for Scientific Accuracy
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
            Bridging statutory water protection benchmarks with modern predictive explainability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, idx) => (
            <div key={idx} className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 w-fit">
                  {f.icon}
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  {f.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {f.desc}
                </p>
              </div>

              <button
                onClick={() => onNavigate(f.action)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
              >
                <span>{f.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
