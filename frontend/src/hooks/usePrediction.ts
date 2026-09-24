import { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  WaterParameters, 
  PredictionResult, 
  ParametersMetadataResponse 
} from '../types';
import { api, ApiError } from '../services/api';

const DEFAULT_PARAMS_A: WaterParameters = {
  temperature: 25.0,
  do: 7.0,
  ph: 7.2,
  conductivity: 500.0,
  bod: 2.4,
  nitrate: 1.2,
  fecal_coliform: 120.0,
};

const DEFAULT_PARAMS_B: WaterParameters = {
  temperature: 28.0,
  do: 4.2,
  ph: 6.8,
  conductivity: 950.0,
  bod: 4.8,
  nitrate: 6.5,
  fecal_coliform: 1800.0,
};

export interface ParameterValidationError {
  key: keyof WaterParameters;
  message: string;
  isExtreme: boolean;
}

export function validateParameters(p: WaterParameters): ParameterValidationError[] {
  const errors: ParameterValidationError[] = [];

  if (p.temperature < 0 || p.temperature > 50) {
    errors.push({ key: 'temperature', message: 'Water temperature typically ranges between 0°C and 45°C.', isExtreme: true });
  }
  if (p.do < 0 || p.do > 20) {
    errors.push({ key: 'do', message: 'Dissolved oxygen in natural water usually sits below 15 mg/L.', isExtreme: true });
  }
  if (p.ph < 0 || p.ph > 14) {
    errors.push({ key: 'ph', message: 'pH must fall within the chemical scale 0–14.', isExtreme: true });
  } else if (p.ph < 5.0 || p.ph > 9.5) {
    errors.push({ key: 'ph', message: 'pH is extreme; standard freshwater is 6.5–8.5.', isExtreme: false });
  }
  if (p.conductivity < 0 || p.conductivity > 20000) {
    errors.push({ key: 'conductivity', message: 'Conductivity above 10,000 µS/cm indicates heavy industrial discharge or seawater.', isExtreme: true });
  }
  if (p.bod < 0 || p.bod > 200) {
    errors.push({ key: 'bod', message: 'BOD exceeds raw sewage levels (> 100 mg/L).', isExtreme: true });
  }
  if (p.nitrate < 0 || p.nitrate > 100) {
    errors.push({ key: 'nitrate', message: 'Nitrate level is exceptionally hazardous (> 45 mg/L regulatory max).', isExtreme: true });
  }
  if (p.fecal_coliform < 0) {
    errors.push({ key: 'fecal_coliform', message: 'Coliform bacteria count cannot be negative.', isExtreme: true });
  }

  return errors;
}

export function usePrediction(initialParams?: WaterParameters) {
  const [paramsA, setParamsA] = useState<WaterParameters>(initialParams || DEFAULT_PARAMS_A);
  const [paramsB, setParamsB] = useState<WaterParameters>(DEFAULT_PARAMS_B);
  const [mode, setMode] = useState<'single' | 'compare'>('single');

  const [resultA, setResultA] = useState<PredictionResult | null>(null);
  const [resultB, setResultB] = useState<PredictionResult | null>(null);

  const [loadingA, setLoadingA] = useState<boolean>(false);
  const [loadingB, setLoadingB] = useState<boolean>(false);
  const [errorA, setErrorA] = useState<string | null>(null);
  const [errorB, setErrorB] = useState<string | null>(null);

  const [metadata, setMetadata] = useState<ParametersMetadataResponse | null>(null);
  const [hasRunInitial, setHasRunInitial] = useState<boolean>(false);

  const abortCtrlARef = useRef<AbortController | null>(null);
  const abortCtrlBRef = useRef<AbortController | null>(null);

  // Fetch authoritative metadata from backend on mount
  useEffect(() => {
    let mounted = true;
    api.getParametersMetadata()
      .then((data) => {
        if (mounted) setMetadata(data);
      })
      .catch(() => {
        // Handled gracefully; defaults will serve
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Perform prediction for Sample A
  const analyzeA = useCallback(async (sampleParams: WaterParameters = paramsA) => {
    if (abortCtrlARef.current) {
      abortCtrlARef.current.abort();
    }
    const ctrl = new AbortController();
    abortCtrlARef.current = ctrl;

    setLoadingA(true);
    setErrorA(null);

    try {
      const res = await api.predict(sampleParams, ctrl.signal);
      setResultA(res);
      setHasRunInitial(true);

      // Celebrate high water quality with confetti in single mode
      if (res.ml_score >= 3 && mode === 'single') {
        confetti({
          particleCount: 25,
          spread: 60,
          origin: { y: 0.75 }
        });
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const msg = err instanceof ApiError ? err.message : 'Unable to complete water quality assessment.';
      setErrorA(msg);
    } finally {
      setLoadingA(false);
    }
  }, [paramsA, mode]);

  // Sync initialParams if passed down
  useEffect(() => {
    if (initialParams) {
      setParamsA(initialParams);
      analyzeA(initialParams);
    }
  }, [initialParams, analyzeA]);

  // Perform prediction for Sample B
  const analyzeB = useCallback(async (sampleParams: WaterParameters = paramsB) => {
    if (abortCtrlBRef.current) {
      abortCtrlBRef.current.abort();
    }
    const ctrl = new AbortController();
    abortCtrlBRef.current = ctrl;

    setLoadingB(true);
    setErrorB(null);

    try {
      const res = await api.predict(sampleParams, ctrl.signal);
      setResultB(res);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const msg = err instanceof ApiError ? err.message : 'Unable to complete Sample B assessment.';
      setErrorB(msg);
    } finally {
      setLoadingB(false);
    }
  }, [paramsB]);

  // Initial assessment on component mount
  useEffect(() => {
    if (!hasRunInitial) {
      analyzeA(DEFAULT_PARAMS_A);
    }
  }, [hasRunInitial, analyzeA]);

  // When switching to compare mode, run B if not already present
  useEffect(() => {
    if (mode === 'compare' && !resultB) {
      analyzeB(paramsB);
    }
  }, [mode, resultB, analyzeB, paramsB]);

  const updateParamA = (key: keyof WaterParameters, val: number) => {
    setParamsA(prev => ({ ...prev, [key]: val }));
  };

  const updateParamB = (key: keyof WaterParameters, val: number) => {
    setParamsB(prev => ({ ...prev, [key]: val }));
  };

  const applyPresetA = (newVals: WaterParameters) => {
    setParamsA(newVals);
    analyzeA(newVals);
  };

  const applyPresetB = (newVals: WaterParameters) => {
    setParamsB(newVals);
    analyzeB(newVals);
  };

  const validationErrorsA = validateParameters(paramsA);
  const validationErrorsB = validateParameters(paramsB);

  return {
    paramsA,
    paramsB,
    mode,
    setMode,
    resultA,
    resultB,
    loadingA,
    loadingB,
    errorA,
    errorB,
    metadata,
    updateParamA,
    updateParamB,
    applyPresetA,
    applyPresetB,
    analyzeA,
    analyzeB,
    validationErrorsA,
    validationErrorsB
  };
}
