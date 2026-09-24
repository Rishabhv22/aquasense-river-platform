import { 
  WaterParameters, 
  PredictionResult, 
  DatasetResponse, 
  DatasetFilters, 
  SummaryKPIs, 
  ClassDistributionItem, 
  ParameterDistributions, 
  CorrelationMatrix, 
  StationCard, 
  ForecastData,
  ModelAnalytics,
  ParametersMetadataResponse,
  HealthResponse
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      const msg = errorBody.message || errorBody.detail || `Server error ${res.status}: ${res.statusText}`;
      throw new ApiError(msg, res.status);
    }

    return await res.json();
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }
    // Network error / connection refused
    throw new ApiError('Unable to connect to the AquaSense analysis service. Please check that the backend service is running.');
  }
}

export const api = {
  // Health
  checkHealth: (signal?: AbortSignal): Promise<HealthResponse> => 
    fetchJson<HealthResponse>('/api/health', { signal }),

  // Authoritative Parameter Metadata & Presets
  getParametersMetadata: (signal?: AbortSignal): Promise<ParametersMetadataResponse> =>
    fetchJson<ParametersMetadataResponse>('/api/parameters', { signal }),

  // Water Quality Assessment Prediction
  predict: (params: WaterParameters, signal?: AbortSignal): Promise<PredictionResult> => 
    fetchJson<PredictionResult>('/api/predict', {
      method: 'POST',
      body: JSON.stringify(params),
      signal,
    }),

  // Feature Importance
  getFeatureImportance: (signal?: AbortSignal): Promise<{ feature_importance: PredictionResult['feature_importance']; disclaimer: string }> => 
    fetchJson('/api/feature-importance', { signal }),

  // Dataset Explorer
  getDataset: (params: {
    search?: string;
    river?: string;
    state?: string;
    year?: number;
    cpcb_class?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    page?: number;
    page_size?: number;
  }, signal?: AbortSignal): Promise<DatasetResponse> => {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.river) query.set('river', params.river);
    if (params.state) query.set('state', params.state);
    if (params.year) query.set('year', params.year.toString());
    if (params.cpcb_class) query.set('cpcb_class', params.cpcb_class);
    if (params.sort_by) query.set('sort_by', params.sort_by);
    if (params.sort_order) query.set('sort_order', params.sort_order);
    if (params.page) query.set('page', params.page.toString());
    if (params.page_size) query.set('page_size', params.page_size.toString());
    return fetchJson<DatasetResponse>(`/api/dataset?${query.toString()}`, { signal });
  },

  getFilters: (signal?: AbortSignal): Promise<DatasetFilters> => 
    fetchJson<DatasetFilters>('/api/dataset/filters', { signal }),

  exportCsvUrl: () => `${API_BASE}/api/dataset/export`,

  // Analytics & Statistics
  getStatistics: (signal?: AbortSignal): Promise<SummaryKPIs> => 
    fetchJson<SummaryKPIs>('/api/statistics', { signal }),

  getClassDistribution: (signal?: AbortSignal): Promise<{ classes: ClassDistributionItem[] }> => 
    fetchJson<{ classes: ClassDistributionItem[] }>('/api/classes', { signal }),

  getDistributions: (signal?: AbortSignal): Promise<ParameterDistributions> => 
    fetchJson<ParameterDistributions>('/api/analytics/distributions', { signal }),

  getCorrelation: (signal?: AbortSignal): Promise<CorrelationMatrix> => 
    fetchJson<CorrelationMatrix>('/api/analytics/correlation', { signal }),

  getModelAnalytics: (signal?: AbortSignal): Promise<ModelAnalytics> => 
    fetchJson<ModelAnalytics>('/api/analytics/model', { signal }),

  // Stations
  getStations: (river?: string, status?: string, signal?: AbortSignal): Promise<StationCard[]> => {
    const query = new URLSearchParams();
    if (river) query.set('river', river);
    if (status) query.set('status', status);
    return fetchJson<StationCard[]>(`/api/stations?${query.toString()}`, { signal });
  },

  getMappedStations: (signal?: AbortSignal): Promise<{ 
    stations: StationCard[]; 
    total_stations: number; 
    mapped_count: number; 
    unmapped_count: number; 
    notice: string 
  }> => 
    fetchJson('/api/stations/map', { signal }),

  // Trend Projections (Historical 2013-2023 vs 2024-2025 Extrapolations)
  getForecast: (river?: string, signal?: AbortSignal): Promise<ForecastData> => {
    const query = new URLSearchParams();
    if (river) query.set('river', river);
    return fetchJson<ForecastData>(`/api/forecast?${query.toString()}`, { signal });
  }
};
