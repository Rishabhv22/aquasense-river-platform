from typing import List, Dict, Optional
from pydantic import BaseModel, Field


class WaterParametersInput(BaseModel):
    temperature: float = Field(25.0, ge=0.0, le=60.0, description="Temperature in °C (Freshwater range: 0–60°C)")
    do: float = Field(7.0, ge=0.0, le=30.0, description="Dissolved Oxygen in mg/L (Freshwater range: 0–30 mg/L)")
    ph: float = Field(7.0, ge=0.0, le=14.0, description="pH level (0–14)")
    conductivity: float = Field(500.0, ge=0.0, le=50000.0, description="Conductivity in µS/cm (Freshwater range: 0–50000 µS/cm)")
    bod: float = Field(4.0, ge=0.0, le=500.0, description="Biological Oxygen Demand in mg/L (Freshwater range: 0–500 mg/L)")
    nitrate: float = Field(1.0, ge=0.0, le=200.0, description="Nitrate concentration in mg/L (Freshwater range: 0–200 mg/L)")
    fecal_coliform: float = Field(100.0, ge=0.0, le=5000000.0, description="Fecal Coliform in CFU/100mL (Freshwater range: 0–5000000 CFU/100mL)")

    model_config = {
        "json_schema_extra": {
            "example": {
                "temperature": 25.0,
                "do": 7.0,
                "ph": 7.2,
                "conductivity": 500.0,
                "bod": 2.4,
                "nitrate": 1.2,
                "fecal_coliform": 120.0
            }
        }
    }


class ParameterDefinitionItem(BaseModel):
    key: str
    name: str
    unit: str
    min_value: float
    max_value: float
    step: float
    default_value: float
    good_range: List[float]
    regulatory_threshold: str
    guidance: str
    scientific_role: str


class PresetItem(BaseModel):
    id: str
    label: str
    description: str
    category: str  # "class_preset" or "river_station"
    values: WaterParametersInput


class ParametersMetadataResponse(BaseModel):
    parameters: List[ParameterDefinitionItem]
    presets: List[PresetItem]
    cpcb_classes: Dict[str, Dict[str, str]]
    disclaimer: str


class ParameterAnalysisItem(BaseModel):
    name: str
    key: str
    value: float
    unit: str
    status: str  # "Excellent", "Good", "Moderate", "Warning", "Critical"
    recommended_range: str
    explanation: str
    score: float  # Sub-score from 0 to 100


class EngineeredFeatures(BaseModel):
    do_bod_ratio: float
    pollution_index: float
    ph_deviation: float
    conductivity_log: float
    rule_label_feature: int


class FeatureImportanceItem(BaseModel):
    feature: str
    label: str
    importance: float
    percentage: float
    rank: int
    description: str


class PredictionResponse(BaseModel):
    cpcb_class: str
    cpcb_code: str
    cpcb_score: int
    ml_class: str
    ml_code: str
    ml_score: int
    confidence: float
    confidence_percentage: float
    probabilities: Dict[str, float]
    agreement: bool
    agreement_message: str
    status_banner: str
    status_level: str  # "excellent", "good", "moderate", "poor"
    water_quality_indicator: float  # 0 to 100
    indicator_label: str
    limiting_factor: str
    engineered_features: EngineeredFeatures
    parameters_analysis: List[ParameterAnalysisItem]
    warnings: List[str]
    insights: List[str]
    feature_importance: List[FeatureImportanceItem]
