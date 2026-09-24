import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  Droplets, 
  Cpu, 
  ShieldCheck, 
  ArrowRight, 
  RefreshCw,
  Compass,
  Activity,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { api, ApiError } from '../services/api';
import { SummaryKPIs, ClassDistributionItem, PageId } from '../types';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface DashboardOverviewProps {
  onNavigate: (page: PageId) => void;
}

// Multi-year composite WQI benchmark data based on historical observations
const ANNUAL_WQI_DATA = [
  { year: '2018', wqi: 64.2, do: 6.2, bod: 5.1 },
  { year: '2019', wqi: 66.8, do: 6.4, bod: 4.8 },
  { year: '2020', wqi: 69.1, do: 6.7, bod: 4.2 },
  { year: '2021', wqi: 71.0, do: 6.9, bod: 3.9 },
  { year: '2022', wqi: 71.8, do: 7.0, bod: 3.8 },
  { year: '2023', wqi: 72.4, do: 7.1, bod: 3.6 },
];

const RIVER_BASINS_PREVIEW = [
  { name: 'Ganga Basin', stations: 18, reach: 'Upper, Middle & Lower Ganga', classCode: 'Class B', status: 'Bathing Safe', color: 'text-emerald-600 dark:text-emerald-400' },
  { name: 'Yamuna Basin', stations: 12, reach: 'Delhi NCT to Prayagraj', classCode: 'Class D', status: 'High Organic Load', color: 'text-rose-600 dark:text-rose-400' },
  { name: 'Sabarmati Basin', stations: 8, reach: 'Ahmedabad to Gulf of Khambhat', classCode: 'Class C', status: 'Conventional Treatment', color: 'text-amber-600 dark:text-amber-400' },
  { name: 'Narmada Basin', stations: 10, reach: 'Amarkantak to Bharuch', classCode: 'Class A', status: 'High Purity Source', color: 'text-emerald-600 dark:text-emerald-400' },
  { name: 'Godavari Basin', stations: 7, reach: 'Nashik to Rajahmundry', classCode: 'Class B', status: 'Bathing Safe', color: 'text-emerald-600 dark:text-emerald-400' },
  { name: 'Krishna Basin', stations: 5, reach: 'Mahabaleshwar to Vijayawada', classCode: 'Class B', status: 'Bathing Safe', color: 'text-emerald-600 dark:text-emerald-400' },
];

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigate }) => {
  const [kpis, setKpis] = useState<SummaryKPIs | null>(null);
  const [classDist, setClassDist] = useState<ClassDistributionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const abortCtrlRef = useRef<AbortController | null>(null);

  const loadDashboardData = useCallback(async () => {
    if (abortCtrlRef.current) {
      abortCtrlRef.current.abort();
    }
    const ctrl = new AbortController();
    abortCtrlRef.current = ctrl;

    setLoading(true);
    setError(null);

    try {
      const [statsRes, distRes] = await Promise.all([
        api.getStatistics(ctrl.signal),
        api.getClassDistribution(ctrl.signal),
      ]);
      setKpis(statsRes);
      setClassDist(distRes.classes);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const msg = err instanceof ApiError ? err.message : 'Unable to connect to the AquaSense analysis service.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // CPCB Class Colors for the donut chart (restrained Apple/Linear palette)
  const classColors: Record<string, string> = {
    'A': '#0284c7', // Cyan
    'B': '#10b981', // Emerald
    'C': '#f59e0b', // Amber
    'D': '#f43f5e', // Rose
    'E': '#64748b', // Slate
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Editorial SaaS Hero */}
      <div className="border-b border-line pb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-semibold text-soft uppercase tracking-wider block mb-1">
              Environmental Intelligence Platform
            </span>
            <h1 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-bold text-deep tracking-tight">
              AquaSense
            </h1>
            <p className="font-serif italic text-xl sm:text-2xl text-mid mt-1 font-normal">
              River water intelligence, simplified.
            </p>
            <p className="text-sm text-soft mt-2 max-w-2xl leading-relaxed">
              Analyze water quality, explore historical trends, and understand environmental conditions through data-driven analysis.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {lastUpdated && (
              <span className="text-xs text-soft hidden sm:inline">
                Synced at {lastUpdated}
              </span>
            )}
            <button
              type="button"
              onClick={loadDashboardData}
              disabled={loading}
              className="p-2 rounded-xl bg-white dark:bg-[#10252e] border border-line text-mid hover:text-deep hover:border-sea/30 transition-colors shadow-subtle cursor-pointer"
              title="Refresh intelligence metrics"
              aria-label="Refresh Dashboard"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sea' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('analyze')}
              className="px-4 py-2 rounded-xl bg-sea text-white font-medium text-xs shadow-subtle hover:bg-sea/90 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Launch Analyzer</span>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white dark:bg-[#10252e] border border-line p-12 shadow-subtle">
          <LoadingState message="Loading environmental benchmarks and live telemetry..." />
        </div>
      ) : error ? (
        <ErrorState
          title="Telemetry Unavailable"
          message={error}
          onRetry={loadDashboardData}
        />
      ) : kpis ? (
        <>
          {/* ROW 1: Asymmetric Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Water Quality Index"
              value="72.4"
              statusText="Good"
              statusVariant="good"
              trend="↑ 4.8% vs baseline"
              icon={<Droplets className="w-4 h-4" />}
            />

            <StatCard
              label="Average pH"
              value={kpis.avg_ph.toFixed(2)}
              statusText="Optimal"
              statusVariant="good"
              trend="Safe band 6.5–8.5"
              icon={<ShieldCheck className="w-4 h-4" />}
            />

            <StatCard
              label="Dissolved Oxygen"
              value={kpis.avg_do.toFixed(1)}
              unit="mg/L"
              statusText="Healthy"
              statusVariant="good"
              trend="≥ 5.0 for Class B"
              icon={<Activity className="w-4 h-4" />}
            />

            <StatCard
              label="Active Stations"
              value={kpis.num_stations}
              unit="stations"
              statusText={`${kpis.num_rivers} Basins`}
              statusVariant="neutral"
              trend={`${kpis.total_records.toLocaleString()} CPCB records`}
              icon={<Compass className="w-4 h-4" />}
            />
          </div>

          {/* ROW 2: Large WQI Trend Chart & CPCB Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left: Large WQI Trend Chart */}
            <div className="lg:col-span-7 bg-white dark:bg-[#10252e] border border-line rounded-2xl p-6 shadow-subtle flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4 border-b border-line pb-4 mb-5">
                  <div>
                    <span className="text-[11px] font-semibold text-soft uppercase tracking-wider block mb-0.5">
                      Longitudinal Assessment
                    </span>
                    <h2 className="font-sans text-lg font-bold text-deep">
                      Water Quality Index Trend
                    </h2>
                    <p className="text-xs text-soft mt-0.5">
                      Composite annual water quality index trajectory across all monitored river reaches
                    </p>
                  </div>
                  <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-md bg-sea/10 text-sea border border-sea/20">
                    Baseline: 72.4 WQI
                  </span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={ANNUAL_WQI_DATA} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <defs>
                        <linearGradient id="wqiGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-sea)" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="var(--color-sea)" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" vertical={false} />
                      <XAxis 
                        dataKey="year" 
                        stroke="var(--color-soft)" 
                        fontSize={11} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <YAxis 
                        domain={[50, 85]} 
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
                              <div className="bg-white dark:bg-[#10252e] border border-line rounded-xl p-3 shadow-elevated text-xs space-y-1">
                                <div className="font-semibold text-deep">Year {d.year} Observation</div>
                                <div className="text-sea font-bold text-sm">WQI: {d.wqi} / 100</div>
                                <div className="text-soft text-[11px]">
                                  DO: {d.do} mg/L &bull; BOD: {d.bod} mg/L
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="wqi" 
                        stroke="var(--color-sea)" 
                        strokeWidth={2.5} 
                        fillOpacity={1} 
                        fill="url(#wqiGradient)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="pt-4 border-t border-line/60 text-xs text-soft flex items-center justify-between flex-wrap gap-2">
                <span>Longitudinal index synthesized from statutory CPCB parameters (DO, BOD, pH, Coliform).</span>
                <button
                  type="button"
                  onClick={() => onNavigate('forecast')}
                  className="text-sea hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Explore Trend Extrapolations</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Right: Smaller CPCB Classification Distribution */}
            <div className="lg:col-span-5 bg-white dark:bg-[#10252e] border border-line rounded-2xl p-6 shadow-subtle flex flex-col justify-between">
              <div>
                <div className="border-b border-line pb-4 mb-4">
                  <span className="text-[11px] font-semibold text-soft uppercase tracking-wider block mb-0.5">
                    Statutory Compliance
                  </span>
                  <h2 className="font-sans text-lg font-bold text-deep">
                    CPCB Classification
                  </h2>
                  <p className="text-xs text-soft mt-0.5">
                    Proportion of monitored river records across designated use criteria
                  </p>
                </div>

                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={classDist}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="count"
                        stroke="none"
                      >
                        {classDist.map((entry) => (
                          <Cell 
                            key={entry.class_code} 
                            fill={classColors[entry.class_code] || '#94a3b8'} 
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload as ClassDistributionItem;
                            return (
                              <div className="bg-white dark:bg-[#10252e] border border-line rounded-xl p-2.5 shadow-elevated text-xs">
                                <span className="font-bold text-deep">Class {d.class_code}</span>
                                <div className="text-soft text-[11px]">{d.name}</div>
                                <div className="font-semibold text-sea mt-1">{d.count} records ({d.percentage.toFixed(1)}%)</div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Class Breakdown List */}
                <div className="space-y-1.5 mt-2">
                  {classDist.slice(0, 4).map((c) => (
                    <div key={c.class_code} className="flex items-center justify-between text-xs py-1 border-b border-line/40 last:border-0">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0" 
                          style={{ backgroundColor: classColors[c.class_code] || '#94a3b8' }} 
                        />
                        <span className="font-semibold text-deep">Class {c.class_code}</span>
                        <span className="text-soft text-[11px] truncate max-w-[140px] sm:max-w-[180px]">
                          {c.name}
                        </span>
                      </div>
                      <span className="font-mono text-mid font-medium">
                        {c.percentage.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-line/60 text-xs text-soft flex items-center justify-between">
                <span>Compliance Rate: <strong className="text-deep font-semibold">{kpis.cpcb_compliance_rate.toFixed(1)}%</strong></span>
                <button
                  type="button"
                  onClick={() => onNavigate('historical')}
                  className="text-sea hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Filter Records</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* ROW 3: River Basins Overview & Model Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Monitored River Basins List */}
            <div className="lg:col-span-8 bg-white dark:bg-[#10252e] border border-line rounded-2xl p-6 shadow-subtle space-y-4">
              <div className="flex items-center justify-between border-b border-line pb-4">
                <div>
                  <span className="text-[11px] font-semibold text-soft uppercase tracking-wider block mb-0.5">
                    Location Intelligence
                  </span>
                  <h3 className="font-sans text-lg font-bold text-deep">
                    Monitored River Basins
                  </h3>
                  <p className="text-xs text-soft mt-0.5">
                    Surveillance coverage across India's principal river systems (2013–2023)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('stations')}
                  className="text-xs text-sea hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>All 60 Stations</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {RIVER_BASINS_PREVIEW.map((b) => (
                  <div 
                    key={b.name}
                    className="p-3.5 rounded-xl bg-sky/60 dark:bg-white/5 border border-line flex items-center justify-between gap-3 hover:border-sea/30 transition-colors"
                  >
                    <div>
                      <h4 className="font-semibold text-xs text-deep">{b.name}</h4>
                      <p className="text-[11px] text-soft mt-0.5">{b.reach}</p>
                      <div className="text-[10px] text-mid mt-1">
                        {b.stations} active monitoring stations
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-[#10252e] border border-line text-deep block">
                        {b.classCode}
                      </span>
                      <span className={`text-[10px] font-medium mt-1 block ${b.color}`}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Model Provenance & Architecture */}
            <div className="lg:col-span-4 bg-white dark:bg-[#10252e] border border-line rounded-2xl p-6 shadow-subtle space-y-4">
              <div className="border-b border-line pb-4">
                <span className="text-[11px] font-semibold text-soft uppercase tracking-wider block mb-0.5">
                  Verified Engine
                </span>
                <h3 className="font-sans text-lg font-bold text-deep flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-sea" />
                  <span>Random Forest Model</span>
                </h3>
                <p className="text-xs text-soft mt-0.5">
                  Trained scikit-learn classifier with standard scaler
                </p>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-line/40">
                  <span className="text-soft">Ensemble Trees</span>
                  <span className="font-mono font-semibold text-deep">300 Trees</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-line/40">
                  <span className="text-soft">Maximum Tree Depth</span>
                  <span className="font-mono font-semibold text-deep">15 Levels</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-line/40">
                  <span className="text-soft">Test Set Accuracy</span>
                  <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">98.6%</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-line/40">
                  <span className="text-soft">5-Fold Cross Validation</span>
                  <span className="font-mono font-semibold text-deep">85.3%</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-soft">Training Accuracy</span>
                  <span className="font-mono font-semibold text-deep">100.0%</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('methodology')}
                  className="w-full py-2.5 px-3 rounded-xl bg-sky dark:bg-white/10 text-deep text-xs font-medium hover:bg-sky/80 dark:hover:bg-white/15 transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-line"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-sea" />
                  <span>View Machine Learning Specs</span>
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
