import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  HelpCircle, 
  Clock, 
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { useStations } from '../hooks/useStations';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { WaterParameters } from '../types';

interface StationsPageProps {
  onSelectStationForAnalysis?: (params: WaterParameters) => void;
}

export const StationsPage: React.FC<StationsPageProps> = ({ onSelectStationForAnalysis }) => {
  const {
    stations,
    riverFilter,
    setRiverFilter,
    statusFilter,
    setStatusFilter,
    loading,
    error,
    refetch
  } = useStations();

  const [search, setSearch] = useState('');

  const filtered = stations.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.station_code.toLowerCase().includes(q) ||
      s.monitoring_location.toLowerCase().includes(q) ||
      s.river_name.toLowerCase().includes(q) ||
      s.state_name.toLowerCase().includes(q)
    );
  });

  const getBadgeClass = (code: string) => {
    switch (code) {
      case 'Class A': return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200/60';
      case 'Class B': return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200/60';
      case 'Class C': return 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200/60';
      case 'Class D': return 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200/60';
      case 'Class E': return 'bg-alert/15 text-alert border-alert/30 font-bold';
      default: return 'bg-sky text-soft border-line';
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="border-b border-line pb-6">
        <span className="text-[11px] font-semibold text-soft uppercase tracking-wider block mb-1">
          Surveillance Network
        </span>
        <h1 className="font-sans text-3xl sm:text-4xl font-bold text-deep tracking-tight">
          River Monitoring Stations
        </h1>
        <p className="text-sm text-soft mt-1 max-w-2xl">
          Directory of registered CPCB surveillance nodes across Godavari, Narmada, Sabarmati, Yamuna, Krishna, and Mahanadi river systems.
        </p>
      </div>

      {/* Notice Banner */}
      <div className="rounded-xl bg-sky/60 dark:bg-[#10252e] border border-line p-4 text-xs text-deep flex items-start gap-3 shadow-subtle">
        <HelpCircle className="w-4 h-4 text-sea shrink-0 mt-0.5" />
        <span className="text-soft leading-relaxed">
          Physical-chemical observations reflect verified annual records from the CPCB monitoring program. Stations without verified GPS coordinates are explicitly identified as &quot;Location unavailable&quot;.
        </span>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-[#10252e] border border-line rounded-2xl p-4 shadow-subtle flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-soft absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search station code, location description, or state..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-sky/60 dark:bg-white/5 border border-line text-deep placeholder:text-soft focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={riverFilter}
            onChange={(e) => setRiverFilter(e.target.value)}
            className="flex-1 sm:flex-none py-2 px-3 text-xs font-medium rounded-xl bg-sky/60 dark:bg-white/5 border border-line text-deep focus:outline-hidden cursor-pointer"
          >
            <option value="">All River Basins</option>
            <option value="Godavari">Godavari</option>
            <option value="Narmada">Narmada</option>
            <option value="Sabarmati">Sabarmati</option>
            <option value="Yanuma">Yamuna</option>
            <option value="Krishna">Krishna</option>
            <option value="Mahanadi">Mahanadi</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 sm:flex-none py-2 px-3 text-xs font-medium rounded-xl bg-sky/60 dark:bg-white/5 border border-line text-deep focus:outline-hidden cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="Historical Record">Historical Data</option>
            <option value="Periodic Telemetry">Periodic Telemetry</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white dark:bg-[#10252e] border border-line p-12 shadow-subtle">
          <LoadingState message="Loading registered river surveillance stations..." />
        </div>
      ) : error ? (
        <ErrorState
          title="Station Service Notice"
          message={error}
          onRetry={refetch}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No Stations Found"
          message="No monitoring stations match your search and filter criteria."
          onReset={() => { setSearch(''); setRiverFilter(''); setStatusFilter(''); }}
        />
      ) : (
        /* Stations Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((station) => (
            <div 
              key={station.station_code} 
              className="bg-white dark:bg-[#10252e] border border-line rounded-2xl p-5 shadow-subtle hover:border-sea/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-soft font-semibold">
                    Station #{station.station_code}
                  </span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-sky dark:bg-white/10 text-soft">
                    {station.status === 'Historical Record' ? 'Historical Data' : station.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-sans font-bold text-base text-deep">
                    {station.river_name} — <span className="font-normal text-mid">{station.monitoring_location}</span>
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-soft mt-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {station.state_name} &bull; {station.latitude !== null ? `${station.latitude.toFixed(2)}°N, ${station.longitude?.toFixed(2)}°E` : 'Location unavailable'}
                    </span>
                  </div>
                </div>

                {/* Metric Summary Strip */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-sky/50 dark:bg-white/5 border border-line text-center text-xs">
                  <div>
                    <div className="text-[10px] text-soft">DO (mg/L)</div>
                    <div className="font-bold text-deep mt-0.5">{station.do !== null ? station.do.toFixed(1) : '—'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-soft">BOD (mg/L)</div>
                    <div className="font-bold text-deep mt-0.5">{station.bod !== null ? station.bod.toFixed(1) : '—'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-soft">pH Level</div>
                    <div className="font-bold text-deep mt-0.5">{station.ph !== null ? station.ph.toFixed(1) : '—'}</div>
                  </div>
                </div>
              </div>

              {/* Card Footer: CPCB Class & Diagnostic Button */}
              <div className="pt-3 border-t border-line/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getBadgeClass(station.cpcb_code)}`}>
                    {station.cpcb_code}
                  </span>
                  <span className="text-[11px] text-soft flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {station.last_recorded_year}
                  </span>
                </div>

                {onSelectStationForAnalysis && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectStationForAnalysis({
                        temperature: station.temperature ?? 25.0,
                        do: station.do ?? 6.5,
                        ph: station.ph ?? 7.4,
                        conductivity: station.conductivity ?? 500.0,
                        bod: station.bod ?? 2.5,
                        nitrate: station.nitrate ?? 1.5,
                        fecal_coliform: station.fecal_coliform ?? 150.0,
                      });
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-sea hover:underline cursor-pointer"
                  >
                    <span>Analyze</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
