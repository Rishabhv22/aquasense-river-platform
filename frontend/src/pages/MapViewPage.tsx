import React, { useState, useEffect, useMemo } from 'react';
import { 
  MapPin, 
  Layers, 
  Compass, 
  ArrowUpRight,
  Info,
  Search,
  Filter
} from 'lucide-react';
import { useStations } from '../hooks/useStations';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { StationCard, WaterParameters } from '../types';

interface MapViewPageProps {
  onSelectStationForAnalysis?: (params: WaterParameters) => void;
}

export const MapViewPage: React.FC<MapViewPageProps> = ({ onSelectStationForAnalysis }) => {
  const {
    mappedStations,
    unmappedCount,
    loading,
    error,
    refetch
  } = useStations();

  const [selectedStation, setSelectedStation] = useState<StationCard | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRiver, setSelectedRiver] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');

  useEffect(() => {
    if (mappedStations.length > 0 && !selectedStation) {
      setSelectedStation(mappedStations[0]);
    }
  }, [mappedStations, selectedStation]);

  // Unique rivers from mapped stations
  const rivers = useMemo(() => {
    const list = Array.from(new Set(mappedStations.map(s => s.river_name).filter(Boolean)));
    return list.sort();
  }, [mappedStations]);

  // Filtered stations based on search, river, and class
  const filteredStations = useMemo(() => {
    return mappedStations.filter(station => {
      if (selectedRiver !== 'all' && station.river_name !== selectedRiver) {
        return false;
      }
      if (selectedClass !== 'all' && station.cpcb_code !== selectedClass) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = station.river_name.toLowerCase().includes(q);
        const matchesLoc = (station.monitoring_location || '').toLowerCase().includes(q);
        const matchesCode = (station.station_code || '').toLowerCase().includes(q);
        const matchesState = (station.state_name || '').toLowerCase().includes(q);
        if (!matchesName && !matchesLoc && !matchesCode && !matchesState) {
          return false;
        }
      }
      return true;
    });
  }, [mappedStations, selectedRiver, selectedClass, searchQuery]);

  const getClassColor = (code?: string) => {
    switch (code) {
      case 'Class A':
        return { 
          bg: 'bg-sea', 
          badge: 'bg-sea/10 text-sea border-sea/25' 
        };
      case 'Class B':
        return { 
          bg: 'bg-sea/80', 
          badge: 'bg-sea/15 text-sea border-sea/30' 
        };
      case 'Class C':
        return { 
          bg: 'bg-sand', 
          badge: 'bg-sand/15 text-[#9c7627] dark:text-sand border-sand/30' 
        };
      case 'Class D':
        return { 
          bg: 'bg-alert/80', 
          badge: 'bg-alert/15 text-alert border-alert/25' 
        };
      case 'Class E':
        return { 
          bg: 'bg-alert', 
          badge: 'bg-alert/20 text-alert border-alert/30' 
        };
      default:
        return { 
          bg: 'bg-soft', 
          badge: 'bg-sky dark:bg-white/10 text-mid border-line' 
        };
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header & Metric Meta */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sea uppercase tracking-wider mb-1">
            <Compass className="w-3.5 h-3.5 text-sea" />
            <span>Geospatial River Surveillance</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-deep">
            Observation Hubs &amp; River Basins
          </h1>
          <p className="text-xs sm:text-sm text-mid mt-1 max-w-2xl">
            Calibrated geographic positioning of national water quality observation hubs across Indian river systems.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#10252e] border border-line text-deep font-medium shadow-xs">
            <span className="inline-block w-2 h-2 rounded-full bg-sea mr-1.5" />
            {mappedStations.length} Calibrated Nodes
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-sky/80 dark:bg-white/5 border border-line text-soft">
            {unmappedCount} Location Unavailable
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-[#10252e] rounded-2xl border border-line p-3.5 shadow-subtle flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-soft" />
          <input
            type="text"
            placeholder="Search stations, rivers, locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-sky/70 dark:bg-white/5 border border-line rounded-xl text-deep placeholder:text-soft focus:outline-none focus:ring-1 focus:ring-sea"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-mid">
            <Filter className="w-3.5 h-3.5 text-soft" />
            <span>Basin:</span>
            <select
              value={selectedRiver}
              onChange={(e) => setSelectedRiver(e.target.value)}
              className="text-xs bg-sky/70 dark:bg-white/5 border border-line rounded-xl px-2.5 py-1 text-deep focus:outline-none focus:ring-1 focus:ring-sea"
            >
              <option value="all">All River Basins</option>
              {rivers.map(r => (
                <option key={r} value={r}>{r} River</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-mid">
            <span>CPCB:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="text-xs bg-sky/70 dark:bg-white/5 border border-line rounded-xl px-2.5 py-1 text-deep focus:outline-none focus:ring-1 focus:ring-sea"
            >
              <option value="all">All Classes</option>
              <option value="Class A">Class A</option>
              <option value="Class B">Class B</option>
              <option value="Class C">Class C</option>
              <option value="Class D">Class D</option>
              <option value="Class E">Class E</option>
            </select>
          </div>

          {(searchQuery || selectedRiver !== 'all' || selectedClass !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedRiver('all');
                setSelectedClass('all');
              }}
              className="text-xs text-soft hover:text-deep underline decoration-line underline-offset-2 ml-auto md:ml-2 cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white dark:bg-[#10252e] border border-line p-12 shadow-subtle">
          <LoadingState message="Loading calibrated river coordinate nodes..." />
        </div>
      ) : error ? (
        <ErrorState
          title="Map Service Notice"
          message={error}
          onRetry={refetch}
        />
      ) : (
        /* Map Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Map Visual Canvas */}
          <div className="lg:col-span-8 bg-white dark:bg-[#10252e] rounded-2xl border border-line p-5 shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-line">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-sea" />
                <h2 className="text-sm font-semibold text-deep">
                  National River Basin Map Canvas
                </h2>
                <span className="text-[11px] font-mono text-soft">
                  ({filteredStations.length} visible)
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-mid">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-sea" /> A/B
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-sand" /> C
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-alert" /> D/E
                </span>
              </div>
            </div>

            {/* Stylized Map Viewport */}
            <div className="relative w-full h-[450px] rounded-2xl bg-sky/50 dark:bg-[#081820] border border-line overflow-hidden flex items-center justify-center p-4">
              {/* Subtle Grid Lines */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000006_1px,transparent_1px),linear-gradient(to_bottom,#00000006_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:40px_40px]" />

              {/* Background River Contours */}
              <svg className="w-full h-full opacity-50 dark:opacity-30 pointer-events-none" viewBox="0 0 800 600" fill="none" aria-hidden="true">
                {/* Indo-Gangetic & Yamuna */}
                <path d="M 120 180 Q 280 230 450 250 T 720 280" stroke="var(--color-sea)" strokeWidth="2.5" strokeDasharray="6 4" />
                {/* Narmada */}
                <path d="M 180 300 Q 320 320 500 330 T 660 340" stroke="var(--color-sea)" strokeWidth="2.5" strokeDasharray="6 4" />
                {/* Godavari */}
                <path d="M 200 380 Q 380 400 520 420 T 690 440" stroke="var(--color-sand)" strokeWidth="2.5" strokeDasharray="6 4" />
                {/* Krishna */}
                <path d="M 230 460 Q 400 480 540 500 T 670 510" stroke="var(--color-sea)" strokeWidth="2.5" strokeDasharray="6 4" />
                {/* Mahanadi */}
                <path d="M 500 320 Q 580 340 680 360 T 750 370" stroke="var(--color-mid)" strokeWidth="2.5" strokeDasharray="6 4" />
              </svg>

              {/* Interactive Station Pins */}
              <div className="absolute inset-0 p-6">
                {filteredStations.map((station) => {
                  const latPct = 100 - ((station.latitude! - 15) / (30 - 15)) * 100;
                  const lngPct = ((station.longitude! - 71) / (88 - 71)) * 100;

                  const isSelected = selectedStation?.station_code === station.station_code;
                  const colors = getClassColor(station.cpcb_code);

                  return (
                    <button
                      key={station.station_code}
                      type="button"
                      onClick={() => setSelectedStation(station)}
                      style={{
                        top: `${Math.max(6, Math.min(92, latPct))}%`,
                        left: `${Math.max(6, Math.min(92, lngPct))}%`,
                      }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-all duration-200 focus:outline-none ${
                        isSelected ? 'scale-125 z-30' : 'scale-100 z-10 hover:scale-115 hover:z-20'
                      }`}
                      aria-label={`Station ${station.station_code}: ${station.river_name} at ${station.monitoring_location}`}
                    >
                      <div className={`p-2 rounded-full shadow-subtle transition-all border ${
                        isSelected
                          ? 'bg-sea text-white border-white ring-4 ring-sea/30'
                          : 'bg-white dark:bg-[#10252e] text-sea border-line hover:border-sea'
                      }`}>
                        <div className="relative">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${colors.bg} ring-1 ring-white dark:ring-[#10252e]`} />
                        </div>
                      </div>

                      {/* Tooltip on hover */}
                      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:flex flex-col items-center bg-deep text-white text-[11px] px-2.5 py-1.5 rounded-xl shadow-elevated z-40 whitespace-nowrap pointer-events-none">
                        <span className="font-semibold">{station.river_name} River</span>
                        <span className="text-[10px] text-soft">#{station.station_code} &bull; {station.cpcb_code}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Map Footer Bounds Indicator */}
              <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-[#10252e]/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-line text-[11px] text-soft flex items-center gap-2 shadow-xs">
                <Compass className="w-3.5 h-3.5 text-sea" />
                <span>Geographic Scope: Indian River Basins (15°–30°N, 71°–88°E)</span>
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs text-soft pt-1">
              <Info className="w-4 h-4 text-sea shrink-0 mt-0.5" />
              <span>
                Displaying calibrated monitoring hubs from verified registry records. {unmappedCount} historical stations without validated GPS coordinates are classified as &ldquo;Location unavailable&rdquo; to preserve scientific integrity.
              </span>
            </div>
          </div>

          {/* Station Details Sidebar Panel */}
          <div className="lg:col-span-4 bg-white dark:bg-[#10252e] rounded-2xl border border-line p-5 shadow-subtle space-y-5">
            <div className="border-b border-line pb-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-soft block">
                Selected Monitoring Node
              </span>
              <div className="flex items-center justify-between mt-1">
                <h3 className="font-serif text-lg font-bold text-deep">
                  {selectedStation ? `${selectedStation.river_name} River` : 'Select a Station'}
                </h3>
                {selectedStation && (
                  <span className="font-mono text-xs text-soft bg-sky dark:bg-white/10 px-2 py-0.5 rounded-md border border-line">
                    #{selectedStation.station_code}
                  </span>
                )}
              </div>
            </div>

            {selectedStation ? (
              <div className="space-y-4 text-xs">
                {/* Location Details */}
                <div>
                  <span className="text-soft font-medium">Monitoring Location:</span>
                  <p className="text-deep font-semibold mt-0.5 leading-relaxed text-sm">
                    {selectedStation.monitoring_location || 'Designated Station Site'}
                  </p>
                  <p className="text-mid text-[11px] mt-0.5">
                    {selectedStation.state_name} &bull; Registry Record
                  </p>
                </div>

                {/* Metadata Card */}
                <div className="p-3.5 rounded-xl bg-sky/60 dark:bg-white/5 border border-line space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-mid">CPCB Classification:</span>
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getClassColor(selectedStation.cpcb_code).badge}`}>
                      {selectedStation.cpcb_code}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-mid">Telemetry Status:</span>
                    <span className="text-deep font-medium inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-sea" />
                      {selectedStation.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-mid">Last Recorded Year:</span>
                    <span className="font-mono text-deep font-medium">{selectedStation.last_recorded_year}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-mid">Coordinates:</span>
                    <span className="font-mono text-deep text-[11px]">
                      {selectedStation.latitude !== null && selectedStation.longitude !== null
                        ? `${selectedStation.latitude.toFixed(3)}°N, ${selectedStation.longitude.toFixed(3)}°E`
                        : 'Location unavailable'}
                    </span>
                  </div>
                </div>

                {/* Core Parameters Mini-Grid */}
                <div>
                  <span className="text-[11px] font-medium text-soft block mb-2">
                    Station Baseline Parameters
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 rounded-xl bg-sky/50 dark:bg-white/5 border border-line">
                      <span className="text-soft text-[10px] uppercase font-semibold">DO</span>
                      <strong className="block text-deep font-semibold text-sm mt-0.5">
                        {selectedStation.do !== null ? `${selectedStation.do} mg/L` : '—'}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-sky/50 dark:bg-white/5 border border-line">
                      <span className="text-soft text-[10px] uppercase font-semibold">BOD</span>
                      <strong className="block text-deep font-semibold text-sm mt-0.5">
                        {selectedStation.bod !== null ? `${selectedStation.bod} mg/L` : '—'}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-sky/50 dark:bg-white/5 border border-line">
                      <span className="text-soft text-[10px] uppercase font-semibold">pH</span>
                      <strong className="block text-deep font-semibold text-sm mt-0.5">
                        {selectedStation.ph !== null ? selectedStation.ph : '—'}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-sky/50 dark:bg-white/5 border border-line">
                      <span className="text-soft text-[10px] uppercase font-semibold">Cond</span>
                      <strong className="block text-deep font-semibold text-sm mt-0.5">
                        {selectedStation.conductivity !== null ? `${selectedStation.conductivity}` : '—'}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-sky/50 dark:bg-white/5 border border-line">
                      <span className="text-soft text-[10px] uppercase font-semibold">Nitrate</span>
                      <strong className="block text-deep font-semibold text-sm mt-0.5">
                        {selectedStation.nitrate !== null ? `${selectedStation.nitrate}` : '—'}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-sky/50 dark:bg-white/5 border border-line">
                      <span className="text-soft text-[10px] uppercase font-semibold">Coliform</span>
                      <strong className="block text-deep font-semibold text-sm mt-0.5">
                        {selectedStation.fecal_coliform !== null ? `${selectedStation.fecal_coliform}` : '—'}
                      </strong>
                    </div>
                  </div>
                </div>

                {onSelectStationForAnalysis && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectStationForAnalysis({
                        temperature: selectedStation.temperature ?? 25,
                        do: selectedStation.do ?? 6.5,
                        ph: selectedStation.ph ?? 7.4,
                        conductivity: selectedStation.conductivity ?? 450,
                        bod: selectedStation.bod ?? 2.8,
                        nitrate: selectedStation.nitrate ?? 1.5,
                        fecal_coliform: selectedStation.fecal_coliform ?? 200,
                      });
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-sea hover:bg-sea/90 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-subtle mt-2"
                  >
                    <span>Load Station into Diagnostic Analyzer</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <p className="text-xs text-soft italic">Click on any river node marker on the map to inspect water quality measurements.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
