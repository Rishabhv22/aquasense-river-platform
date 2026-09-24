from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class DatasetRecord(BaseModel):
    id: int
    year: Optional[int] = None
    river_name: str
    station_code: Optional[str] = None
    monitoring_location: Optional[str] = None
    state_name: Optional[str] = None
    temperature: Optional[float] = None
    do: Optional[float] = None
    ph: Optional[float] = None
    conductivity: Optional[float] = None
    bod: Optional[float] = None
    nitrate: Optional[float] = None
    fecal_coliform: Optional[float] = None
    cpcb_class: Optional[str] = None
    cpcb_code: Optional[str] = None


class DatasetQueryResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    records: List[DatasetRecord]


class SummaryKPIs(BaseModel):
    total_records: int
    year_range: str
    num_rivers: int
    num_states: int
    num_stations: int
    avg_ph: float
    avg_do: float
    avg_bod: float
    avg_conductivity: float
    avg_nitrate: float
    avg_fecal_coliform: float
    avg_pollution_index: float
    cpcb_compliance_rate: float
    dominant_class: str


class StationCard(BaseModel):
    station_code: str
    river_name: str
    monitoring_location: str
    state_name: str
    status: str  # "Online", "Demo Telemetry", "Periodic"
    is_live_stream: bool
    last_recorded_year: int
    temperature: Optional[float] = None
    do: Optional[float] = None
    ph: Optional[float] = None
    conductivity: Optional[float] = None
    bod: Optional[float] = None
    nitrate: Optional[float] = None
    fecal_coliform: Optional[float] = None
    cpcb_class: str
    cpcb_code: str
    water_quality_indicator: float
    latitude: Optional[float] = None
    longitude: Optional[float] = None
