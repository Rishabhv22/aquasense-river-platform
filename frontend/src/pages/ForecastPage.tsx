import React, { useState } from 'react';
import { 
  HelpCircle,
  TrendingUp,
  Clock
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { useForecast } from '../hooks/useForecast';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';

export const ForecastPage: React.FC = () => {
  const {
    selectedRiver,
    setSelectedRiver,
    data,
    loading,
    error,
    availableRivers,
    refetch
  } = useForecast('Sabarmati');

  const [activeParam, setActiveParam] = useState<'do_bod' | 'ph' | 'conductivity'>('do_bod');

  interface ForecastChartPoint {
    year: string;
    DO_hist: number | null;
    BOD_hist: number | null;
    pH_hist: number | null;
    Conductivity_hist: number | null;
    DO_proj: number | null;
    BOD_proj: number | null;
    pH_proj: number | null;
    Conductivity_proj: number | null;
    type: string;
  }

  // Chart data formatting with explicit historical vs projected segments
  const chartData = React.useMemo(() => {
    if (!data) return [];
    
    const hist: ForecastChartPoint[] = data.historical_data.map(h => ({
      year: h.year.toString(),
      DO_hist: h.do,
      BOD_hist: h.bod,
      pH_hist: h.ph,
      Conductivity_hist: h.conductivity ?? null,
      DO_proj: null,
      BOD_proj: null,
      pH_proj: null,
      Conductivity_proj: null,
      type: 'Historical CPCB Observation (2013–2023)'
    }));

    // Transition bridge on the last historical point
    const lastHist = data.historical_data[data.historical_data.length - 1];
    if (lastHist && hist.length > 0) {
      hist[hist.length - 1] = {
        ...hist[hist.length - 1],
        DO_proj: lastHist.do,
        BOD_proj: lastHist.bod,
        pH_proj: lastHist.ph,
        Conductivity_proj: lastHist.conductivity ?? null,
      };
    }

    const proj = data.projected_data.map(p => ({
      year: `${p.year} (Proj.)`,
      DO_hist: null,
      BOD_hist: null,
      pH_hist: null,
      Conductivity_hist: null,
      DO_proj: p.do,
      BOD_proj: p.bod,
      pH_proj: p.ph,
      Conductivity_proj: p.conductivity ?? null,
      type: 'Statistical Trend Projection (2024–2025)'
    }));

    return [...hist, ...proj];
  }, [data]);

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <span className="text-[11px] font-semibold text-soft uppercase tracking-wider block mb-1">
            Statistical Extrapolation
          </span>
          <h1 className="font-sans text-3xl sm:text-4xl font-bold text-deep tracking-tight">
            Water Quality Trend Projection
          </h1>
          <p className="text-sm text-soft mt-1 max-w-2xl">
            Longitudinal CPCB observations (2013–2023) paired with linear trend extrapolations for 2024–2025 across major river basins.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <label htmlFor="river-select" className="text-xs text-soft font-medium">Basin:</label>
          <select
            id="river-select"
            value={selectedRiver}
            onChange={(e) => setSelectedRiver(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-[#10252e] border border-line text-deep shadow-subtle focus:outline-hidden cursor-pointer"
          >
            {availableRivers.map(r => (
              <option key={r} value={r}>{r} River Basin</option>
            ))}
          </select>
        </div>
      </div>

      {/* Prominent Methodology Notice */}
      <div className="rounded-2xl bg-sky/60 dark:bg-white/5 border border-line p-4 text-xs text-deep flex items-start gap-3 shadow-subtle">
        <HelpCircle className="w-4 h-4 text-sea shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-deep block mb-0.5">Scientific Methodology Notice</span>
          <p className="text-soft leading-relaxed">
            Projected values are statistical trend extrapolations from historical observations. They should not be interpreted as certified forecasts.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white dark:bg-[#10252e] border border-line p-12 shadow-subtle">
          <LoadingState message={`Computing statistical trend trajectories for ${selectedRiver} River Basin...`} />
        </div>
      ) : error ? (
        <ErrorState
          title="Trend Data Notice"
          message={error}
          onRetry={refetch}
        />
      ) : data ? (
        <>
          {/* Main Trajectory Chart */}
          <div className="bg-white dark:bg-[#10252e] border border-line rounded-2xl p-6 shadow-subtle space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
              <div>
                <span className="text-[11px] font-semibold text-soft uppercase tracking-wider block">
                  {data.river} Basin Trajectory
                </span>
                <h2 className="font-sans text-xl font-bold text-deep mt-0.5">
                  Multi-Year Environmental Trajectory
                </h2>
                <p className="text-xs text-soft mt-0.5">
                  Historical Records: <strong className="text-deep font-mono font-medium">{data.historical_period}</strong> &bull; Statistical Projection: <strong className="text-deep font-mono font-medium">{data.projected_period}</strong>
                </p>
              </div>

              {/* Metric Selector */}
              <div className="flex items-center gap-1.5 bg-sky dark:bg-white/10 p-1 rounded-xl border border-line text-xs">
                <button
                  type="button"
                  onClick={() => setActiveParam('do_bod')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    activeParam === 'do_bod' 
                      ? 'bg-white dark:bg-[#10252e] text-deep shadow-2xs font-semibold' 
                      : 'text-soft hover:text-deep'
                  }`}
                >
                  DO &amp; BOD
                </button>
                <button
                  type="button"
                  onClick={() => setActiveParam('ph')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    activeParam === 'ph' 
                      ? 'bg-white dark:bg-[#10252e] text-deep shadow-2xs font-semibold' 
                      : 'text-soft hover:text-deep'
                  }`}
                >
                  pH Level
                </button>
                <button
                  type="button"
                  onClick={() => setActiveParam('conductivity')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    activeParam === 'conductivity' 
                      ? 'bg-white dark:bg-[#10252e] text-deep shadow-2xs font-semibold' 
                      : 'text-soft hover:text-deep'
                  }`}
                >
                  Conductivity
                </button>
              </div>
            </div>

            {/* Time-series Plot */}
            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" vertical={false} />
                  <XAxis 
                    dataKey="year" 
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
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const isProj = String(label).includes('Proj');
                        return (
                          <div className="bg-white dark:bg-[#10252e] border border-line rounded-xl p-3 shadow-elevated text-xs space-y-1">
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-bold text-deep">{label}</span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                                isProj ? 'bg-sea/15 text-sea font-semibold' : 'bg-sky dark:bg-white/10 text-soft'
                              }`}>
                                {isProj ? 'Projected' : 'Historical'}
                              </span>
                            </div>
                            {payload.map((item, idx) => {
                              if (item.value === null || item.value === undefined) return null;
                              return (
                                <p key={idx} className="text-mid flex items-center justify-between gap-3">
                                  <span>{item.name}:</span>
                                  <strong className="text-deep font-mono">{Number(item.value).toFixed(2)}</strong>
                                </p>
                              );
                            })}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  {activeParam === 'do_bod' && (
                    <>
                      {/* DO Historical (Solid) */}
                      <Line 
                        name="DO (Historical)" 
                        type="monotone" 
                        dataKey="DO_hist" 
                        stroke="var(--color-sea)" 
                        strokeWidth={2.5} 
                        dot={{ r: 3.5, fill: 'var(--color-sea)' }} 
                        activeDot={{ r: 5 }} 
                      />
                      {/* DO Trend Projection (Dashed) */}
                      <Line 
                        name="DO (Trend Extrapolation)" 
                        type="monotone" 
                        dataKey="DO_proj" 
                        stroke="var(--color-sea)" 
                        strokeWidth={2.5} 
                        strokeDasharray="5 5"
                        dot={{ r: 4, fill: 'var(--color-sea)' }} 
                        activeDot={{ r: 6 }} 
                      />
                      {/* BOD Historical (Solid) */}
                      <Line 
                        name="BOD (Historical)" 
                        type="monotone" 
                        dataKey="BOD_hist" 
                        stroke="var(--color-alert)" 
                        strokeWidth={2.5} 
                        dot={{ r: 3.5, fill: 'var(--color-alert)' }} 
                        activeDot={{ r: 5 }} 
                      />
                      {/* BOD Trend Projection (Dashed) */}
                      <Line 
                        name="BOD (Trend Extrapolation)" 
                        type="monotone" 
                        dataKey="BOD_proj" 
                        stroke="var(--color-alert)" 
                        strokeWidth={2.5} 
                        strokeDasharray="5 5"
                        dot={{ r: 4, fill: 'var(--color-alert)' }} 
                        activeDot={{ r: 6 }} 
                      />
                    </>
                  )}

                  {activeParam === 'ph' && (
                    <>
                      <Line 
                        name="pH (Historical)" 
                        type="monotone" 
                        dataKey="pH_hist" 
                        stroke="var(--color-sea)" 
                        strokeWidth={2.5} 
                        dot={{ r: 3.5, fill: 'var(--color-sea)' }} 
                        activeDot={{ r: 5 }} 
                      />
                      <Line 
                        name="pH (Trend Extrapolation)" 
                        type="monotone" 
                        dataKey="pH_proj" 
                        stroke="var(--color-sea)" 
                        strokeWidth={2.5} 
                        strokeDasharray="5 5"
                        dot={{ r: 4, fill: 'var(--color-sea)' }} 
                        activeDot={{ r: 6 }} 
                      />
                    </>
                  )}

                  {activeParam === 'conductivity' && (
                    <>
                      <Line 
                        name="Conductivity (Historical)" 
                        type="monotone" 
                        dataKey="Conductivity_hist" 
                        stroke="var(--color-sand)" 
                        strokeWidth={2.5} 
                        dot={{ r: 3.5, fill: 'var(--color-sand)' }} 
                        activeDot={{ r: 5 }} 
                      />
                      <Line 
                        name="Conductivity (Trend Extrapolation)" 
                        type="monotone" 
                        dataKey="Conductivity_proj" 
                        stroke="var(--color-sand)" 
                        strokeWidth={2.5} 
                        strokeDasharray="5 5"
                        dot={{ r: 4, fill: 'var(--color-sand)' }} 
                        activeDot={{ r: 6 }} 
                      />
                    </>
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Apple SaaS Legend Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 text-xs text-soft border-t border-line/60">
              <div className="flex items-center gap-5">
                <span className="flex items-center gap-2 font-medium text-mid">
                  <span className="w-4 h-0.5 bg-deep inline-block" />
                  <span>Historical Observation (2013–2023)</span>
                </span>
                <span className="flex items-center gap-2 font-medium text-mid">
                  <span className="w-4 h-0.5 border-b-2 border-dashed border-deep inline-block" />
                  <span>Trend Extrapolation (2024–2025)</span>
                </span>
              </div>
              <div className="text-[11px] italic text-soft">
                Statistical ordinary least squares extrapolation via numpy.polyfit.
              </div>
            </div>
          </div>

          {/* Architecture Ready Telemetry Horizon Specifications */}
          <div className="bg-white dark:bg-[#10252e] border border-line rounded-2xl p-6 shadow-subtle space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-soft block">
                  Future Pipeline Integration
                </span>
                <h3 className="font-sans text-lg font-bold text-deep mt-0.5">
                  High-Frequency IoT Telemetry Horizon Specifications
                </h3>
                <p className="text-xs text-soft mt-0.5">
                  Architectural design specifications for automated ingestion of continuous river sensor telemetry
                </p>
              </div>
              <div className="text-xs text-sea font-mono px-2.5 py-1 rounded-md bg-sea/10 border border-sea/20">
                Architecture Ready
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-sky/60 dark:bg-white/5 border border-line space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-semibold text-soft uppercase">Horizon 1</span>
                  <Clock className="w-3.5 h-3.5 text-sea" />
                </div>
                <h4 className="font-semibold text-sm text-deep">24-Hour Diurnal Cycle</h4>
                <p className="text-xs text-soft leading-relaxed">
                  High-frequency time-series tracking nocturnal oxygen depression and daytime photosynthetic recovery.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-sky/60 dark:bg-white/5 border border-line space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-semibold text-soft uppercase">Horizon 2</span>
                  <TrendingUp className="w-3.5 h-3.5 text-sea" />
                </div>
                <h4 className="font-semibold text-sm text-deep">7-Day Synoptic Weather</h4>
                <p className="text-xs text-soft leading-relaxed">
                  Hydrological rainfall-runoff coupling estimating coliform surges and turbidity spikes following precipitation.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-sky/60 dark:bg-white/5 border border-line space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-semibold text-soft uppercase">Horizon 3</span>
                  <Clock className="w-3.5 h-3.5 text-sea" />
                </div>
                <h4 className="font-semibold text-sm text-deep">30-Day Seasonal Flow</h4>
                <p className="text-xs text-soft leading-relaxed">
                  Seasonal decomposition models tracking pre-monsoon baseflow pollutant concentration and monsoon dilution dynamics.
                </p>
              </div>
            </div>

            <div className="text-[11px] text-soft italic pt-1 border-t border-line/60">
              * Note: The current platform uses verified tabular CPCB records (2013–2023). The telemetry section documents planned future hardware integration without fabricating live sensor telemetry.
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
