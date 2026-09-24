export type PageId = 
  | 'home'
  | 'overview'
  | 'analyze'
  | 'forecast'
  | 'historical'
  | 'analytics'
  | 'stations'
  | 'map'
  | 'methodology';

export interface WaterParameters {
  temperature: number;
  do: number;
  ph: number;
  conductivity: number;
  bod: number;
  nitrate: number;
  fecal_coliform: number;
}

export interface ParameterDefinition {
  key: keyof WaterParameters;
  name: string;
  unit: string;
  min_value: number;
  max_value: number;
  step: number;
  default_value: number;
  good_range: [number, number];
  regulatory_threshold: string;
  guidance: string;
  scientific_role: string;
}

export interface PresetItem {
  id: string;
  label: string;
  description: string;
  category: 'class_preset' | 'river_station';
  values: WaterParameters;
}

export interface ParametersMetadataResponse {
  parameters: ParameterDefinition[];
  presets: PresetItem[];
  cpcb_classes: Record<string, {
    code: string;
    name: string;
    description: string;
    status: string;
    banner: string;
  }>;
  disclaimer: string;
}

export interface ParameterAnalysis {
  name: string;
  key: string;
  value: number;
  unit: string;
  status: 'Excellent' | 'Good' | 'Moderate' | 'Warning' | 'Critical';
  recommended_range: string;
  explanation: string;
  score: number;
}

export interface EngineeredFeatures {
  do_bod_ratio: number;
  pollution_index: number;
  ph_deviation: number;
  conductivity_log: number;
  rule_label_feature: number;
}

export interface FeatureImportance {
  feature: string;
  label: string;
  importance: number;
  percentage: number;
  rank: number;
  description: string;
}

export interface PredictionResult {
  cpcb_class: string;
  cpcb_code: string;
  cpcb_score: number;
  ml_class: string;
  ml_code: string;
  ml_score: number;
  confidence: number;
  confidence_percentage: number;
  probabilities: Record<string, number>;
  agreement: boolean;
  agreement_message: string;
  status_banner: string;
  status_level: 'excellent' | 'good' | 'moderate' | 'poor';
  water_quality_indicator: number;
  indicator_label: string;
  limiting_factor: string;
  engineered_features: EngineeredFeatures;
  parameters_analysis: ParameterAnalysis[];
  warnings: string[];
  insights: string[];
  feature_importance: FeatureImportance[];
}

export interface DatasetRecord {
  id: number;
  year: number | null;
  river_name: string;
  station_code: string | null;
  monitoring_location: string | null;
  state_name: string | null;
  temperature: number | null;
  do: number | null;
  ph: number | null;
  conductivity: number | null;
  bod: number | null;
  nitrate: number | null;
  fecal_coliform: number | null;
  cpcb_class: string | null;
  cpcb_code: string | null;
}

export interface DatasetResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  records: DatasetRecord[];
}

export interface DatasetFilters {
  rivers: string[];
  states: string[];
  years: number[];
  classes: string[];
}

export interface SummaryKPIs {
  total_records: number;
  year_range: string;
  num_rivers: number;
  num_states: number;
  num_stations: number;
  avg_ph: number;
  avg_do: number;
  avg_bod: number;
  avg_conductivity: number;
  avg_nitrate: number;
  avg_fecal_coliform: number;
  avg_pollution_index: number;
  cpcb_compliance_rate: number;
  dominant_class: string;
}

export interface ClassDistributionItem {
  class_code: string;
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface DistributionBin {
  bin: string;
  range_start: number;
  range_end: number;
  count: number;
}

export type ParameterDistributions = Record<string, DistributionBin[]>;

export interface CorrelationMatrix {
  columns: string[];
  matrix: Record<string, Record<string, number>>;
}

export interface StationCard {
  station_code: string;
  river_name: string;
  monitoring_location: string;
  state_name: string;
  status: 'Online' | 'Periodic Telemetry' | 'Offline' | 'Historical Record' | string;
  is_live_stream: boolean;
  last_recorded_year: number;
  temperature: number | null;
  do: number | null;
  ph: number | null;
  conductivity: number | null;
  bod: number | null;
  nitrate: number | null;
  fecal_coliform: number | null;
  cpcb_class: string;
  cpcb_code: string;
  water_quality_indicator: number;
  latitude: number | null;
  longitude: number | null;
}

export interface ForecastData {
  river: string;
  available_rivers: string[];
  historical_years?: string;
  historical_period: string;
  projected_period: string;
  methodology_note: string;
  historical_data: Array<{
    year: number;
    do: number | null;
    bod: number | null;
    ph: number | null;
    conductivity?: number | null;
    nitrate?: number | null;
    fecal_coliform?: number | null;
  }>;
  projected_data: Array<{
    year: number;
    do: number | null;
    bod: number | null;
    ph: number | null;
    conductivity?: number | null;
    nitrate?: number | null;
    fecal_coliform?: number | null;
    is_projected: boolean;
    method?: string;
  }>;
  iot_architecture: {
    status: string;
    notice: string;
    supported_horizons: Array<{
      horizon: string;
      status: string;
    }>;
  };
}

export interface ModelAnalytics {
  model_type: string;
  library: string;
  n_estimators: number;
  max_depth: number;
  n_features: number;
  n_classes: number;
  class_labels: string[];
  evaluation_metrics: {
    train_accuracy: number;
    test_accuracy: number;
    five_fold_cv_mean: number;
    test_split_ratio: number;
    stratified: boolean;
    source: string;
  };
  features_used: string[];
  dataset_records: number;
}

export interface HealthResponse {
  status: string;
  ml_engine: string;
  model_type: string;
  scaler_status: string;
  dataset_status: string;
  dataset_records: number;
  cpcb_rule_engine: string;
  python_version: string;
  api_version: string;
}
