from fastapi import APIRouter, HTTPException, Request
from schemas.prediction import (
    WaterParametersInput,
    PredictionResponse,
    ParametersMetadataResponse
)

router = APIRouter(prefix="/api", tags=["Prediction"])


@router.post("/predict", response_model=PredictionResponse)
async def predict_water_quality(params: WaterParametersInput, request: Request):
    """
    Predicts River Water Quality using a hybrid approach:
    1. Regulatory CPCB Rule Engine (Classes A - E)
    2. 12-Feature Engineering Pipeline
    3. Standard Scaling via Scaler Pipeline
    4. Random Forest Inference with Probability & Confidence
    5. CPCB vs ML Agreement Analysis
    6. Automated Water Quality Insights, Parameter Breakdown & Limiting Factor
    """
    try:
        predictor = request.app.state.predictor
        result = predictor.predict(params)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@router.get("/parameters", response_model=ParametersMetadataResponse)
async def get_parameters_metadata(request: Request):
    """
    Authoritative single-source-of-truth metadata for environmental parameters,
    statutory CPCB thresholds, healthy ranges, guidance hints, and validated presets.
    """
    try:
        predictor = request.app.state.predictor
        return predictor.get_parameters_metadata()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching parameters metadata: {str(e)}")


@router.get("/feature-importance")
async def get_feature_importance(request: Request):
    """
    Returns relative feature importances extracted from the Random Forest model.
    """
    try:
        predictor = request.app.state.predictor
        return {
            "feature_importance": predictor.feature_importances,
            "disclaimer": "Feature importance indicates which variables contributed most to the Random Forest model's decision. It does not imply causation."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching feature importance: {str(e)}")
