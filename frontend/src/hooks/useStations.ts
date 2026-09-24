import { useState, useEffect, useCallback, useRef } from 'react';
import { StationCard } from '../types';
import { api, ApiError } from '../services/api';

export function useStations() {
  const [stations, setStations] = useState<StationCard[]>([]);
  const [mappedStations, setMappedStations] = useState<StationCard[]>([]);
  const [totalStations, setTotalStations] = useState<number>(0);
  const [mappedCount, setMappedCount] = useState<number>(0);
  const [unmappedCount, setUnmappedCount] = useState<number>(0);

  const [riverFilter, setRiverFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const abortCtrlRef = useRef<AbortController | null>(null);

  const fetchStations = useCallback(async () => {
    if (abortCtrlRef.current) {
      abortCtrlRef.current.abort();
    }
    const ctrl = new AbortController();
    abortCtrlRef.current = ctrl;

    setLoading(true);
    setError(null);

    try {
      const [listRes, mapRes] = await Promise.all([
        api.getStations(riverFilter || undefined, statusFilter || undefined, ctrl.signal),
        api.getMappedStations(ctrl.signal)
      ]);

      setStations(listRes);
      setMappedStations(mapRes.stations);
      setTotalStations(mapRes.total_stations);
      setMappedCount(mapRes.mapped_count);
      setUnmappedCount(mapRes.unmapped_count);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const msg = err instanceof ApiError ? err.message : 'Unable to load monitoring stations.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [riverFilter, statusFilter]);

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  return {
    stations,
    mappedStations,
    totalStations,
    mappedCount,
    unmappedCount,
    riverFilter,
    setRiverFilter,
    statusFilter,
    setStatusFilter,
    loading,
    error,
    refetch: fetchStations
  };
}
