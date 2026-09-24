import React from 'react';
import { 
  Cpu, 
  ShieldCheck, 
  Layers, 
  Sliders, 
  CheckCircle2, 
  Sparkles,
  GitBranch,
  Scale,
  Activity,
  AlertTriangle,
  BookOpen,
  Database,
  TrendingUp
} from 'lucide-react';

export const MethodologyPage: React.FC = () => {
  const pipelineSteps = [
    { title: '1. In-Situ Observations', desc: '7 physical-chemical observations collected or measured on-site', icon: <Sliders className="w-4 h-4" /> },
    { title: '2. Physical Bounds Check', desc: 'Integrity validation and physical boundary verification', icon: <CheckCircle2 className="w-4 h-4" /> },
    { title: '3. CPCB Rule Prior', desc: 'Statutory threshold evaluation producing baseline Class A–E prior', icon: <ShieldCheck className="w-4 h-4" /> },
    { title: '4. Feature Engineering', desc: 'Computation of DO/BOD ratio, Pollution Index, pH Dev, Log Cond', icon: <Layers className="w-4 h-4" /> },
    { title: '5. Standard Scaling', desc: 'Unit variance transformation via scikit-learn StandardScaler', icon: <Scale className="w-4 h-4" /> },
    { title: '6. Random Forest Vote', desc: 'Consensus voting across 300 decision trees (max depth 15)', icon: <Cpu className="w-4 h-4" /> },
    { title: '7. Confidence Calibration', desc: 'Class probability extraction and CPCB vs ML agreement check', icon: <GitBranch className="w-4 h-4" /> },
    { title: '8. Explainable Insights', desc: 'Gini feature importance ranking, parameter warnings, and remediation targets', icon: <Sparkles className="w-4 h-4" /> },
  ];

  const cpcbCriteria = [
    {
      classCode: 'Class A',
      use: 'Drinking water source without conventional treatment (disinfection only)',
      criteria: 'DO ≥ 6.0 mg/L · BOD ≤ 2.0 mg/L · Fecal Coliform ≤ 50 CFU/100mL · pH 6.5–8.5',
      badgeClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
    },
    {
      classCode: 'Class B',
      use: 'Outdoor bathing (organized contact recreation & swimming)',
      criteria: 'DO ≥ 5.0 mg/L · BOD ≤ 3.0 mg/L · Fecal Coliform ≤ 500 CFU/100mL · pH 6.5–8.5',
      badgeClass: 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800'
    },
    {
      classCode: 'Class C',
      use: 'Drinking water source with conventional treatment followed by disinfection',
      criteria: 'DO ≥ 4.0 mg/L · BOD ≤ 3.0 mg/L · Fecal Coliform ≤ 5,000 CFU/100mL · pH 6.0–9.0',
      badgeClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
    },
    {
      classCode: 'Class D',
      use: 'Propagation of wildlife and commercial fisheries',
      criteria: 'DO ≥ 4.0 mg/L · Free Ammonia ≤ 1.2 mg/L · pH 6.5–8.5',
      badgeClass: 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800'
    },
    {
      classCode: 'Class E',
      use: 'Irrigation, industrial cooling, and controlled waste disposal',
      criteria: 'Electrical Conductivity ≤ 2,250 µS/cm · Sodium Adsorption Ratio < 26 · Boron ≤ 2 mg/L',
      badgeClass: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
    },
  ];

  return (
    <div className="space-y-10 pb-16 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-line pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-soft uppercase tracking-wider mb-1">
          <BookOpen className="w-3.5 h-3.5 text-sea" />
          <span>Scientific Specification &amp; Architecture</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-deep">
          Methodology &amp; Algorithmic Architecture
        </h1>
        <p className="text-sm text-soft mt-2 max-w-3xl leading-relaxed">
          A comprehensive breakdown of how AquaSense unites statutory Central Pollution Control Board (CPCB) regulatory criteria with 300-tree ensemble random forests to deliver robust environmental intelligence.
        </p>
      </div>

      {/* Section 1: End-to-End Prediction Pipeline */}
      <section className="bg-white dark:bg-[#10252e] rounded-2xl border border-line p-6 shadow-subtle space-y-6">
        <div className="border-b border-line/60 pb-4">
          <span className="text-[11px] font-semibold text-sea uppercase tracking-wider block mb-1">
            Execution Flow
          </span>
          <h2 className="text-xl font-semibold text-deep">
            End-to-End Inference Pipeline
          </h2>
          <p className="text-xs text-soft mt-1">
            Every sample flows deterministically through validation, statutory prior generation, domain feature synthesis, and 300-tree ensemble classification.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {pipelineSteps.map((step, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-sky/60 dark:bg-white/5 border border-line flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-white dark:bg-[#10252e] text-sea border border-line shadow-2xs">
                  {step.icon}
                </div>
                <span className="text-[10px] font-mono text-soft font-semibold">
                  STEP 0{idx + 1}
                </span>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-deep">{step.title}</h3>
                <p className="text-[11px] text-soft mt-1 leading-snug">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: Two Columns: Statutory Matrix & Feature Engineering */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Statutory CPCB Standards */}
        <section className="bg-white dark:bg-[#10252e] rounded-2xl border border-line p-6 shadow-subtle space-y-5">
          <div className="flex items-center gap-3 border-b border-line/60 pb-4">
            <div className="p-2 rounded-lg bg-sky dark:bg-white/10 text-sea">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-deep">
                Statutory CPCB Water Quality Matrix
              </h3>
              <p className="text-xs text-soft">MoEFCC Designated Best Use Framework</p>
            </div>
          </div>

          <p className="text-xs text-mid leading-relaxed">
            The Central Pollution Control Board (CPCB) classifies Indian inland surface water into five designated best-use classes based on primary water quality parameters:
          </p>

          <div className="space-y-3">
            {cpcbCriteria.map((c) => (
              <div key={c.classCode} className="p-3.5 rounded-xl bg-sky/60 dark:bg-white/5 border border-line space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-deep">{c.classCode}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${c.badgeClass}`}>
                    {c.classCode}
                  </span>
                </div>
                <p className="text-xs text-mid font-medium leading-snug">{c.use}</p>
                <p className="text-[11px] text-soft font-mono leading-relaxed">{c.criteria}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Engineering Equations */}
        <section className="bg-white dark:bg-[#10252e] rounded-2xl border border-line p-6 shadow-subtle space-y-5">
          <div className="flex items-center gap-3 border-b border-line/60 pb-4">
            <div className="p-2 rounded-lg bg-sky dark:bg-white/10 text-sea">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-deep">
                Engineered Domain Features
              </h3>
              <p className="text-xs text-soft">Non-linear mathematical features synthesized for RF</p>
            </div>
          </div>

          <p className="text-xs text-mid leading-relaxed">
            Raw physical measurements are expanded with domain-engineered features to capture ecological thresholds and non-linear chemical interactions:
          </p>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-sky/60 dark:bg-white/5 border border-line space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-deep">DO / BOD Metabolic Ratio</span>
                <span className="text-[10px] font-mono text-sea font-medium">AEROBIC HEALTH</span>
              </div>
              <div className="font-mono text-xs text-deep bg-white dark:bg-[#0a1920] px-3 py-1.5 rounded-lg border border-line">
                DO_BOD_ratio = DO / (BOD + 0.1)
              </div>
              <p className="text-[11px] text-soft">
                High ratio signifies healthy autotrophic re-aeration; a low ratio indicates severe anaerobic organic overload.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-sky/60 dark:bg-white/5 border border-line space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-deep">Composite Pollution Index</span>
                <span className="text-[10px] font-mono text-sand font-medium">SEVERITY PROXY</span>
              </div>
              <div className="font-mono text-xs text-deep bg-white dark:bg-[#0a1920] px-3 py-1.5 rounded-lg border border-line">
                Pollution_Index = (BOD / 5.0) + (FC / 500.0) + (Nitrate / 10.0)
              </div>
              <p className="text-[11px] text-soft">
                Standardized composite sum of organic (BOD), pathogenic (FC), and agricultural nutrient (Nitrate) stresses against Class B limits.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-sky/60 dark:bg-white/5 border border-line space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-deep">pH Absolute Neutrality Deviation</span>
                <span className="text-[10px] font-mono text-sea font-medium">EQUILIBRIUM DISTANCE</span>
              </div>
              <div className="font-mono text-xs text-deep bg-white dark:bg-[#0a1920] px-3 py-1.5 rounded-lg border border-line">
                pH_deviation = |pH - 7.0|
              </div>
              <p className="text-[11px] text-soft">
                Measures deviation from neutral aquatic equilibrium; penalizes both acidic industrial effluent and excessive alkaline algal blooms.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-sky/60 dark:bg-white/5 border border-line space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-deep">Conductivity Logarithm</span>
                <span className="text-[10px] font-mono text-soft font-medium">LOG DISSOLVED SOLIDS</span>
              </div>
              <div className="font-mono text-xs text-deep bg-white dark:bg-[#0a1920] px-3 py-1.5 rounded-lg border border-line">
                Conductivity_log = log10(Conductivity + 1.0)
              </div>
              <p className="text-[11px] text-soft">
                Compresses heavily skewed ionic conductivity values across orders of magnitude for stable linear scaling.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Section 3: Random Forest Classifier Specifications */}
      <section className="bg-white dark:bg-[#10252e] rounded-2xl border border-line p-6 shadow-subtle space-y-6">
        <div className="border-b border-line/60 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-semibold text-sea uppercase tracking-wider block mb-1">
              Machine Learning Provenance
            </span>
            <h2 className="text-xl font-semibold text-deep">
              Random Forest Classifier Architecture
            </h2>
            <p className="text-xs text-soft mt-1">
              Authentic ground-truth hyperparameters trained in <code className="font-mono text-mid">train_model.ipynb</code> and serialized in <code className="font-mono text-mid">model.pkl</code>.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sea/10 text-sea border border-sea/30">
              98.6% Test Accuracy
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-sky/60 dark:bg-white/5 border border-line">
            <span className="text-[11px] text-soft uppercase font-semibold">Estimators</span>
            <div className="text-2xl text-deep font-semibold mt-1">300 Trees</div>
            <div className="text-[11px] text-soft mt-0.5">Bootstrap aggregation ensemble</div>
          </div>

          <div className="p-4 rounded-xl bg-sky/60 dark:bg-white/5 border border-line">
            <span className="text-[11px] text-soft uppercase font-semibold">Max Tree Depth</span>
            <div className="text-2xl text-deep font-semibold mt-1">15 Levels</div>
            <div className="text-[11px] text-soft mt-0.5">Prevents tree overfitting</div>
          </div>

          <div className="p-4 rounded-xl bg-sky/60 dark:bg-white/5 border border-line">
            <span className="text-[11px] text-soft uppercase font-semibold">Splitting Criterion</span>
            <div className="text-2xl text-deep font-semibold mt-1">Gini Impurity</div>
            <div className="text-[11px] text-soft mt-0.5">Optimal multi-class division</div>
          </div>

          <div className="p-4 rounded-xl bg-sky/60 dark:bg-white/5 border border-line">
            <span className="text-[11px] text-soft uppercase font-semibold">Pre-Scaler</span>
            <div className="text-2xl text-sea font-semibold mt-1">StandardScaler</div>
            <div className="text-[11px] text-soft mt-0.5">Zero mean, unit variance</div>
          </div>
        </div>

        {/* Validation Matrix */}
        <div className="p-4 rounded-xl bg-sky/50 dark:bg-white/5 border border-line space-y-2">
          <h4 className="text-xs font-semibold text-deep flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-sea" />
            <span>Cross-Validation &amp; Split Performance</span>
          </h4>
          <p className="text-xs text-soft leading-relaxed">
            The dataset (1,864 samples across 6 major Indian river systems) underwent stratified 80/20 train/test splitting followed by 5-fold cross-validation. The model demonstrates strong out-of-fold generalization with 85.3% 5-fold CV accuracy and 98.6% holdout test accuracy across all five CPCB classes.
          </p>
        </div>
      </section>

      {/* Section 4: Data Source & Registry */}
      <section className="bg-white dark:bg-[#10252e] rounded-2xl border border-line p-6 shadow-subtle space-y-4">
        <div className="flex items-center gap-3 border-b border-line/60 pb-4">
          <div className="p-2 rounded-lg bg-sky dark:bg-white/10 text-sea">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-deep">
              Data Provenance &amp; National Registry
            </h3>
            <p className="text-xs text-soft">Central Pollution Control Board National Water Quality Monitoring Programme</p>
          </div>
        </div>

        <div className="text-xs text-mid leading-relaxed space-y-2.5">
          <p>
            Historical records are compiled from periodic monitoring registries spanning Godavari, Krishna, Mahanadi, Narmada, Sabarmati, and Yamuna basins. Each record captures in-situ physical measurements along with chemical and microbiological assays.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3 rounded-lg bg-sky/60 dark:bg-white/5 border border-line">
              <span className="text-soft text-[10px] uppercase font-semibold">Total Registry Records</span>
              <div className="text-lg font-semibold text-deep mt-0.5">1,864 Samples</div>
            </div>
            <div className="p-3 rounded-lg bg-sky/60 dark:bg-white/5 border border-line">
              <span className="text-soft text-[10px] uppercase font-semibold">Monitored Basins</span>
              <div className="text-lg font-semibold text-deep mt-0.5">6 Major River Systems</div>
            </div>
            <div className="p-3 rounded-lg bg-sky/60 dark:bg-white/5 border border-line">
              <span className="text-soft text-[10px] uppercase font-semibold">Temporal Span</span>
              <div className="text-lg font-semibold text-deep mt-0.5">Multi-Year Annual Series</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Trend Projection Methodology & Scientific Limitations */}
      <section className="bg-white dark:bg-[#10252e] rounded-2xl border border-line p-6 shadow-subtle space-y-4">
        <div className="flex items-center gap-3 border-b border-line/60 pb-4">
          <div className="p-2 rounded-lg bg-sand/15 text-sand">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-deep">
              Trend Projection Methodology &amp; Scientific Limitations
            </h3>
            <p className="text-xs text-soft">Statutory Compliance &amp; Hydrodynamic Modeling Distinction</p>
          </div>
        </div>

        <div className="text-xs text-mid leading-relaxed space-y-3">
          <p>
            <strong className="text-deep">Statistical Extrapolation Notice:</strong> The forecasts generated in the &ldquo;Water Quality Trend Projection&rdquo; module are data-driven statistical extrapolations derived from observed historical annual registry records. They represent empirical directionality and trajectory under current multi-year trends.
          </p>
          <div className="p-3.5 rounded-xl bg-sand/10 border border-sand/30 text-deep">
            <div className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-sand shrink-0 mt-0.5" />
              <span className="text-mid">
                These projections do <strong>not</strong> substitute for full computational fluid dynamics (CFD), 2D/3D hydrodynamic river models, or reactive chemical transport simulations (such as QUAL2K or WASP). Weather anomalies, industrial discharge changes, or upstream dam discharges may cause actual readings to deviate from statistical trajectories.
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
