import pytest
import os
import sys

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from services.predictor import PredictorService
from schemas.prediction import WaterParametersInput


@pytest.fixture
def predictor():
    model_path = os.path.join(backend_dir, "model.pkl")
    scaler_path = os.path.join(backend_dir, "scaler.pkl")
    return PredictorService(model_path, scaler_path)


def test_cpcb_rule_classes():
    # Class A: do >= 6, bod <= 2, fc <= 50, 6.5 <= ph <= 8.5
    assert PredictorService.cpcb_rule(do=7.5, bod=1.5, fc=30, ph=7.2) == 4

    # Class B: do >= 5, bod <= 3, fc <= 500, 6.5 <= ph <= 8.5
    assert PredictorService.cpcb_rule(do=5.5, bod=2.5, fc=300, ph=7.5) == 3

    # Class C: do >= 4, bod <= 3, fc <= 5000, 6.0 <= ph <= 9.0
    assert PredictorService.cpcb_rule(do=4.5, bod=2.8, fc=2000, ph=6.2) == 2

    # Class D: do >= 4
    assert PredictorService.cpcb_rule(do=4.2, bod=8.0, fc=10000, ph=7.0) == 1

    # Class E: do < 4
    assert PredictorService.cpcb_rule(do=2.0, bod=15.0, fc=50000, ph=5.5) == 0


def test_limiting_factors():
    # Class A
    p_a = WaterParametersInput(temperature=22.0, do=7.5, ph=7.2, conductivity=200.0, bod=1.5, nitrate=0.8, fecal_coliform=30.0)
    lf_a = PredictorService.get_limiting_factor(p_a, 4)
    assert "Class A" in lf_a

    # Class B restricted from Class A by DO
    p_b = WaterParametersInput(temperature=25.0, do=5.5, ph=7.2, conductivity=300.0, bod=1.5, nitrate=1.0, fecal_coliform=30.0)
    lf_b = PredictorService.get_limiting_factor(p_b, 3)
    assert "Restricted from Class A" in lf_b
    assert "DO" in lf_b

    # Class E restricted by low DO
    p_e = WaterParametersInput(temperature=30.0, do=2.0, ph=7.0, conductivity=1200.0, bod=12.0, nitrate=15.0, fecal_coliform=20000.0)
    lf_e = PredictorService.get_limiting_factor(p_e, 0)
    assert "Restricted to Class E" in lf_e


def test_predictor_execution(predictor):
    params = WaterParametersInput(
        temperature=25.0,
        do=7.0,
        ph=7.0,
        conductivity=500.0,
        bod=4.0,
        nitrate=1.0,
        fecal_coliform=100.0
    )
    result = predictor.predict(params)

    assert result.cpcb_code in ["Class A", "Class B", "Class C", "Class D", "Class E"]
    assert result.ml_code in ["Class A", "Class B", "Class C", "Class D", "Class E"]
    assert 0.0 <= result.confidence <= 1.0
    assert len(result.probabilities) == 5
    assert 0.0 <= result.water_quality_indicator <= 100.0
    assert len(result.parameters_analysis) == 7
    assert len(result.feature_importance) == 12
    assert result.limiting_factor is not None
    assert len(result.limiting_factor) > 0
    assert result.engineered_features.do_bod_ratio > 0


def test_parameters_metadata(predictor):
    meta = predictor.get_parameters_metadata()
    assert len(meta.parameters) == 7
    assert len(meta.presets) >= 4
    assert len(meta.cpcb_classes) == 5
    assert "disclaimer" in meta.model_dump()


def test_boundary_values(predictor):
    # Extreme low values
    p_min = WaterParametersInput(
        temperature=0.0,
        do=0.0,
        ph=0.0,
        conductivity=0.0,
        bod=0.0,
        nitrate=0.0,
        fecal_coliform=0.0
    )
    res_min = predictor.predict(p_min)
    assert res_min.cpcb_code == "Class E"
    assert res_min.water_quality_indicator >= 0.0

    # High values
    p_high = WaterParametersInput(
        temperature=45.0,
        do=14.0,
        ph=14.0,
        conductivity=10000.0,
        bod=200.0,
        nitrate=100.0,
        fecal_coliform=1000000.0
    )
    res_high = predictor.predict(p_high)
    assert res_high.water_quality_indicator <= 100.0
