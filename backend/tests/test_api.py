import pytest
import os
import sys
import json
import urllib.request
import urllib.error

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from services.predictor import PredictorService
from services.data_service import DataService
from schemas.prediction import WaterParametersInput


@pytest.fixture(scope="module")
def app_services():
    model_path = os.path.join(backend_dir, "model.pkl")
    scaler_path = os.path.join(backend_dir, "scaler.pkl")
    excel_path = os.path.join(backend_dir, "water_quality.xlsx")
    predictor = PredictorService(model_path, scaler_path)
    data_service = DataService(excel_path)
    return predictor, data_service


def test_metadata_service(app_services):
    predictor, _ = app_services
    meta = predictor.get_parameters_metadata()
    assert len(meta.parameters) == 7
    assert len(meta.presets) >= 4
    assert len(meta.cpcb_classes) == 5
    assert "disclaimer" in meta.model_dump()


def test_predict_service(app_services):
    predictor, _ = app_services
    p = WaterParametersInput(
        temperature=25.0,
        do=7.0,
        ph=7.2,
        conductivity=500.0,
        bod=2.4,
        nitrate=1.2,
        fecal_coliform=120.0
    )
    res = predictor.predict(p)
    assert res.cpcb_code in ["Class A", "Class B", "Class C", "Class D", "Class E"]
    assert res.ml_code in ["Class A", "Class B", "Class C", "Class D", "Class E"]
    assert res.limiting_factor is not None
    assert len(res.parameters_analysis) == 7
    assert 0 <= res.water_quality_indicator <= 100


def test_dataset_service(app_services):
    _, data_service = app_services
    res = data_service.query_dataset(page=1, page_size=15)
    assert res.total > 1800
    assert len(res.records) == 15
    assert data_service.kpis.num_rivers >= 5


def test_stations_service(app_services):
    _, data_service = app_services
    stations = data_service.stations
    assert len(stations) > 0
    # Confirm no fabricated DEFAULT coordinates
    for s in stations:
        if s.latitude is not None:
            assert 8.0 <= s.latitude <= 37.0
            assert 68.0 <= s.longitude <= 98.0


def test_live_http_health_if_running():
    try:
        req = urllib.request.urlopen("http://127.0.0.1:8000/api/health", timeout=2)
        assert req.status == 200
        data = json.loads(req.read().decode())
        assert data["status"] == "online"
        assert data["ml_engine"] == "online"
    except (urllib.error.URLError, TimeoutError):
        pytest.skip("Local FastAPI dev server not running on port 8000; skipping live HTTP test")


def test_live_http_parameters_if_running():
    try:
        req = urllib.request.urlopen("http://127.0.0.1:8000/api/parameters", timeout=2)
        assert req.status == 200
        data = json.loads(req.read().decode())
        assert len(data["parameters"]) == 7
        assert len(data["presets"]) >= 4
    except (urllib.error.URLError, TimeoutError):
        pytest.skip("Local FastAPI dev server not running on port 8000; skipping live HTTP test")
