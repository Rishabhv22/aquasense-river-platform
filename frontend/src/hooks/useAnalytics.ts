import { useState, useEffect, useRef } from 'react';
import { ParameterDistributions, CorrelationMatrix, ModelAnalytics } from '../types';
import { api, ApiError } from '../services/api';

export function useAnalytics() {
  const [distributions, setDistributions] = useState<ParameterDistributions>({});
  const [correlation, setCorrelation] = useState<CorrelationMatrix | null>(null);
  const [modelAnalytics, setModelAnalytics] = useState<ModelAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const abortCtrlRef = useRef<AbortController | null>(null);

  const fetchAnalytics = async () => {
    if (abortCtrlRef.current) {
      abortCtrlRef.current.abort();
    }
    const ctrl = new AbortController();
    abortCtrlRef.current = ctrl;

    setLoading(true);
    setError(null);

    try {
      const [distRes, corrRes, modelRes] = await Promise.all([
        api.getDistributions(ctrl.signal),
        api.getCorrelation(ctrl.signal),
        api.getModelAnalytics(ctrl.signal)
      ]);

      setDistributions(distRes);
      setCorrelation(corrRes);
      setModelAnalytics(modelRes);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const msg = err instanceof ApiError ? err.message : 'Unable to load environmental and model analytics.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    distributions,
    correlation,
    modelAnalytics,
    loading,
    error,
    refetch: fetchAnalytics
  };
}
