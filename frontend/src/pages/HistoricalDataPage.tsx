import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  RotateCcw,
  SlidersHorizontal
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
import { useDataset } from '../hooks/useDataset';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';

export const HistoricalDataPage: React.FC = () => {
  const {
    records,
    total,
    page,
    setPage,
    pageSize,
    totalPages,
    loading,
    error,
    search,
    setSearch,
    selectedRiver,
    setSelectedRiver,
    selectedState,
    setSelectedState,
    selectedYear,
    setSelectedYear,
    selectedClass,
    setSelectedClass,
    sortBy,
    sortOrder,
    handleSort,
    availableFilters,
    hasActiveFilters,
    resetFilters,
    refetch,
    exportCsvUrl
  } = useDataset(15);

  const [activeMetric, setActiveMetric] = useState<'do' | 'bod' | 'ph' | 'conductivity' | 'nitrate' | 'fecal_coliform'>('do');

  const sortIcon = (col: string) => sortBy === col ? (sortOrder === 'asc' ? ' ↑' : ' ↓') : '';

  const metricConfig = {
    do: { label: 'Dissolved Oxygen (DO)', unit: 'mg/L', color: 'var(--color-sea)' },
    bod: { label: 'Biochemical Oxygen Demand (BOD)', unit: 'mg/L', color: 'var(--color-alert)' },
    ph: { label: 'pH Level', unit: '', color: 'var(--color-sea)' },
    conductivity: { label: 'Conductivity', unit: 'µS/cm', color: 'var(--color-sand)' },
    nitrate: { label: 'Nitrate (NO₃)', unit: 'mg/L', color: 'var(--color-mid)' },
    fecal_coliform: { label: 'Fecal Coliform', unit: 'CFU/100mL', color: 'var(--color-alert)' },
  }[activeMetric];

  const trendChartData = records.map((r) => ({
    label: `#${r.id}`,
    value: r[activeMetric] ?? 0,
    river: r.river_name,
    year: r.year,
  }));

  const getClassBadge = (code: string | null) => {
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <span className="text-[11px] font-semibold text-soft uppercase tracking-wider block mb-1">
            Data Explorer
          </span>
          <h1 className="font-sans text-3xl sm:text-4xl font-bold text-deep tracking-tight">
            Historical Observations
          </h1>
          <p className="text-sm text-soft mt-1 max-w-2xl">
            Search, filter, and inspect 1,864 official CPCB river monitoring records spanning 2013–2023.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href={exportCsvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-white dark:bg-[#10252e] border border-line text-mid hover:text-deep transition-all shadow-subtle cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV ({total} records)</span>
          </a>
        </div>
      </div>

      {/* Search & Filters Controls */}
      <div className="bg-white dark:bg-[#10252e] border border-line rounded-2xl p-5 shadow-subtle space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search bar */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-soft absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search station, river, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-sky/60 dark:bg-white/5 border border-line text-deep text-xs placeholder:text-soft focus:outline-hidden"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-soft hover:text-deep p-1 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* River Filter */}
          <div>
            <select
              value={selectedRiver}
              onChange={(e) => { setSelectedRiver(e.target.value); setPage(1); }}
              className="w-full py-2 px-3 rounded-xl bg-sky/60 dark:bg-white/5 border border-line text-deep text-xs focus:outline-hidden cursor-pointer"
              aria-label="Filter by River Basin"
            >
              <option value="">All River Basins</option>
              {availableFilters.rivers.map((r) => (
                <option key={r} value={r}>{r} Basin</option>
              ))}
            </select>
          </div>

          {/* State Filter */}
          <div>
            <select
              value={selectedState}
              onChange={(e) => { setSelectedState(e.target.value); setPage(1); }}
              className="w-full py-2 px-3 rounded-xl bg-sky/60 dark:bg-white/5 border border-line text-deep text-xs focus:outline-hidden cursor-pointer"
              aria-label="Filter by Indian State"
            >
              <option value="">All States</option>
              {availableFilters.states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <select
              value={selectedYear}
              onChange={(e) => { setSelectedYear(e.target.value); setPage(1); }}
              className="w-full py-2 px-3 rounded-xl bg-sky/60 dark:bg-white/5 border border-line text-deep text-xs focus:outline-hidden cursor-pointer"
              aria-label="Filter by Monitoring Year"
            >
              <option value="">All Years (2013–2023)</option>
              {availableFilters.years.map((y) => (
                <option key={y} value={y.toString()}>{y}</option>
              ))}
            </select>
          </div>

          {/* CPCB Class Filter */}
          <div>
            <select
              value={selectedClass}
              onChange={(e) => { setSelectedClass(e.target.value); setPage(1); }}
              className="w-full py-2 px-3 rounded-xl bg-sky/60 dark:bg-white/5 border border-line text-deep text-xs focus:outline-hidden cursor-pointer"
              aria-label="Filter by CPCB Classification"
            >
              <option value="">All CPCB Classes</option>
              {availableFilters.classes.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filter Chips & Reset */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-line/60 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold text-soft uppercase tracking-wider">Filters:</span>
              {search && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-sky dark:bg-white/10 border border-line text-xs text-deep">
                  Search: {search}
                  <button type="button" onClick={() => setSearch('')} className="hover:text-rose-500 cursor-pointer"><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedRiver && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-sky dark:bg-white/10 border border-line text-xs text-deep">
                  River: {selectedRiver}
                  <button type="button" onClick={() => setSelectedRiver('')} className="hover:text-rose-500 cursor-pointer"><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedState && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-sky dark:bg-white/10 border border-line text-xs text-deep">
                  State: {selectedState}
                  <button type="button" onClick={() => setSelectedState('')} className="hover:text-rose-500 cursor-pointer"><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedYear && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-sky dark:bg-white/10 border border-line text-xs text-deep">
                  Year: {selectedYear}
                  <button type="button" onClick={() => setSelectedYear('')} className="hover:text-rose-500 cursor-pointer"><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedClass && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-sky dark:bg-white/10 border border-line text-xs text-deep">
                  Class: {selectedClass}
                  <button type="button" onClick={() => setSelectedClass('')} className="hover:text-rose-500 cursor-pointer"><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-xs text-sea hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset all filters</span>
            </button>
          </div>
        )}
      </div>

      {error ? (
        <ErrorState
          title="Dataset Unavailable"
          message={error}
          onRetry={refetch}
        />
      ) : (
        <div className="space-y-6">
          {/* Quick Filtered Records Mini-Chart */}
          {records.length > 0 && (
            <div className="bg-white dark:bg-[#10252e] border border-line rounded-2xl p-5 shadow-subtle space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="font-sans text-xs font-bold text-deep uppercase tracking-wider">
                    Parameter Distribution across Filtered Page Records
                  </h3>
                  <p className="text-[11px] text-soft">
                    Displaying 15 observation values on current page
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <div className="flex rounded-lg bg-sky dark:bg-white/10 p-0.5 border border-line text-[11px]">
                    {(['do', 'bod', 'ph', 'conductivity', 'nitrate', 'fecal_coliform'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setActiveMetric(m)}
                        className={`px-2.5 py-0.5 rounded-md font-medium transition-all cursor-pointer uppercase ${
                          activeMetric === m ? 'bg-white dark:bg-[#10252e] text-deep shadow-2xs font-semibold' : 'text-soft hover:text-deep'
                        }`}
                      >
                        {m === 'fecal_coliform' ? 'FC' : m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="h-36 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" vertical={false} />
                    <XAxis dataKey="label" stroke="var(--color-soft)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--color-soft)" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="bg-white dark:bg-[#10252e] text-deep p-2.5 rounded-xl shadow-elevated text-xs border border-line">
                              <span className="font-semibold block text-sea">{d.river} ({d.year})</span>
                              <p className="text-soft mt-0.5">{metricConfig.label}: <strong className="text-deep">{d.value} {metricConfig.unit}</strong></p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke={metricConfig.color} 
                      strokeWidth={2} 
                      dot={{ r: 2.5, fill: metricConfig.color }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Clean Records Table / Mobile Cards */}
          <div className="bg-white dark:bg-[#10252e] border border-line rounded-2xl shadow-subtle overflow-hidden">
            {loading ? (
              <div className="p-10">
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-9 bg-sky/60 dark:bg-white/5 rounded-lg animate-pulse" />
                  ))}
                </div>
              </div>
            ) : records.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No Matching Water Records"
                  message="No CPCB monitoring records matched your search and filter parameters."
                  onReset={hasActiveFilters ? resetFilters : undefined}
                />
              </div>
            ) : (
              <>
                {/* Desktop Responsive Table */}
                <div className="overflow-x-auto hidden md:block">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-line bg-sky/50 dark:bg-white/5 text-soft font-semibold text-[11px] uppercase tracking-wider">
                        <th className="py-3 px-4 cursor-pointer hover:text-deep" onClick={() => handleSort('id')}>#{sortIcon('id')}</th>
                        <th className="py-3 px-4 cursor-pointer hover:text-deep" onClick={() => handleSort('River_Name')}>River Basin{sortIcon('River_Name')}</th>
                        <th className="py-3 px-4">Location / Station</th>
                        <th className="py-3 px-4 cursor-pointer hover:text-deep" onClick={() => handleSort('Year')}>Year{sortIcon('Year')}</th>
                        <th className="py-3 px-4 cursor-pointer hover:text-deep" onClick={() => handleSort('DO')}>DO (mg/L){sortIcon('DO')}</th>
                        <th className="py-3 px-4 cursor-pointer hover:text-deep" onClick={() => handleSort('pH')}>pH{sortIcon('pH')}</th>
                        <th className="py-3 px-4 cursor-pointer hover:text-deep" onClick={() => handleSort('BOD')}>BOD{sortIcon('BOD')}</th>
                        <th className="py-3 px-4 cursor-pointer hover:text-deep" onClick={() => handleSort('Conductivity')}>Cond.{sortIcon('Conductivity')}</th>
                        <th className="py-3 px-4">Nitrate</th>
                        <th className="py-3 px-4">Fecal Col.</th>
                        <th className="py-3 px-4 text-center">CPCB Class</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line/60">
                      {records.map((r) => (
                        <tr key={r.id} className="hover:bg-sky/40 dark:hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4 font-mono text-soft">#{r.id}</td>
                          <td className="py-3 px-4 font-semibold text-deep">{r.river_name}</td>
                          <td className="py-3 px-4 text-mid max-w-[200px] truncate" title={r.monitoring_location || ''}>
                            {r.monitoring_location || '—'}
                          </td>
                          <td className="py-3 px-4 text-mid font-mono">{r.year || '—'}</td>
                          <td className="py-3 px-4 text-deep font-medium">{r.do !== null ? r.do.toFixed(1) : '—'}</td>
                          <td className="py-3 px-4 text-deep font-medium">{r.ph !== null ? r.ph.toFixed(1) : '—'}</td>
                          <td className="py-3 px-4 text-deep font-medium">{r.bod !== null ? r.bod.toFixed(1) : '—'}</td>
                          <td className="py-3 px-4 text-soft font-mono">{r.conductivity !== null ? r.conductivity.toFixed(0) : '—'}</td>
                          <td className="py-3 px-4 text-soft font-mono">{r.nitrate !== null ? r.nitrate.toFixed(1) : '—'}</td>
                          <td className="py-3 px-4 text-soft font-mono">{r.fecal_coliform !== null ? r.fecal_coliform.toFixed(0) : '—'}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold border ${getClassBadge(r.cpcb_class)}`}>
                              {r.cpcb_class || 'Class C'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Responsive Cards */}
                <div className="md:hidden divide-y divide-line/60 p-4 space-y-4">
                  {records.map((r) => (
                    <div key={r.id} className="pt-4 first:pt-0 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-deep text-sm">{r.river_name}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${getClassBadge(r.cpcb_class)}`}>
                          {r.cpcb_class || 'Class C'}
                        </span>
                      </div>
                      <p className="text-xs text-soft truncate">{r.monitoring_location || 'Location unrecorded'}</p>
                      <div className="grid grid-cols-4 gap-2 text-[11px] font-mono pt-1">
                        <div><span className="text-soft block text-[10px]">DO</span>{r.do?.toFixed(1) ?? '—'}</div>
                        <div><span className="text-soft block text-[10px]">pH</span>{r.ph?.toFixed(1) ?? '—'}</div>
                        <div><span className="text-soft block text-[10px]">BOD</span>{r.bod?.toFixed(1) ?? '—'}</div>
                        <div><span className="text-soft block text-[10px]">Year</span>{r.year ?? '—'}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                <div className="p-4 border-t border-line flex items-center justify-between flex-wrap gap-4 text-xs">
                  <span className="text-soft">
                    Showing <strong className="text-deep font-semibold">{(page - 1) * pageSize + 1}</strong> to <strong className="text-deep font-semibold">{Math.min(page * pageSize, total)}</strong> of <strong className="text-deep font-semibold">{total.toLocaleString()}</strong> records
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                      className="p-1.5 rounded-lg border border-line bg-white dark:bg-white/5 text-mid disabled:opacity-40 disabled:cursor-not-allowed hover:bg-sky/60 dark:hover:bg-white/10 transition-colors"
                      aria-label="Previous Page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <span className="px-3 py-1 font-mono text-soft">
                      {page} / {totalPages || 1}
                    </span>

                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => setPage(page + 1)}
                      className="p-1.5 rounded-lg border border-line bg-white dark:bg-white/5 text-mid disabled:opacity-40 disabled:cursor-not-allowed hover:bg-sky/60 dark:hover:bg-white/10 transition-colors"
                      aria-label="Next Page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
