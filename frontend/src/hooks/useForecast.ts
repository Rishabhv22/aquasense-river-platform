import { useState, useEffect, useCallback, useRef } from 'react';
import { ForecastData } from '../types';
import { api, ApiError } from '../services/api';

export function useForecast(initialRiver = 'Sabarmati') {
  const [selectedRiver, setSelectedRiver] = useState<string>(initialRiver);
  const [data, setData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const abortCtrlRef = useRef<AbortController | null>(null);

  const fetchForecast = useCallback(async (river: string) => {
    if (abortCtrlRef.current) {
      abortCtrlRef.current.abort();
    }
    const ctrl = new AbortController();
    abortCtrlRef.current = ctrl;

    setLoading(true);
    setError(null);

    try {
      const res = await api.getForecast(river, ctrl.signal);
      setData(res);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const msg = err instanceof ApiError ? err.message : 'Unable to load water quality trend projections.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchForecast(selectedRiver);
  }, [selectedRiver, fetchForecast]);

  const availableRivers = data?.available_rivers || [
    'Sabarmati', 'Narmada', 'Godavari', 'Yamuna', 'Krishna', 'Mahanadi'
  ];

  return {
    selectedRiver,
    setSelectedRiver,
    data,
    loading,
    error,
    availableRivers,
    refetch: () => fetchForecast(selectedRiver),
    methodologyNote: data?.methodology_note || 'Projected values are statistical trend extrapolations from historical observations and should not be interpreted as certified forecasts.'
  };
}
