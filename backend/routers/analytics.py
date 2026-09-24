from fastapi import APIRouter, HTTPException, Request
from schemas.dataset import SummaryKPIs

router = APIRouter(prefix="/api", tags=["Analytics & Statistics"])


@router.get("/statistics", response_model=SummaryKPIs)
async def get_statistics(request: Request):
    """
    Returns platform-wide summary Key Performance Indicators (KPIs) calculated across the 1,868 records.
    """
    try:
        return request.app.state.data_service.kpis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error computing statistics: {str(e)}")


@router.get("/classes")
async def get_class_distribution(request: Request):
    """
    Returns CPCB Class distribution (Classes A through E) across the historical dataset.
    """
    try:
        return {
            "classes": request.app.state.data_service.class_distribution
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching class distribution: {str(e)}")


@router.get("/analytics/distributions")
async def get_parameter_distributions(request: Request):
    """
    Returns binned histogram data for core water quality parameters (pH, DO, BOD, Conductivity, Nitrate, Fecal Coliform).
    """
    try:
        return request.app.state.data_service.distributions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching distributions: {str(e)}")


@router.get("/analytics/correlation")
async def get_correlation_matrix(request: Request):
    """
    Returns Pearson correlation matrix between environmental parameters.
    """
    try:
        return request.app.state.data_service.correlations
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error computing correlation: {str(e)}")


@router.get("/analytics/model")
async def get_model_analytics(request: Request):
    """
    Returns verified model architecture and training evaluation metrics directly extracted from train_model.ipynb.
    """
    try:
        predictor = request.app.state.predictor
        return {
            "model_type": "Random Forest Classifier",
            "library": "Scikit-Learn (ensemble.RandomForestClassifier)",
            "n_estimators": 300,
            "max_depth": 15,
            "n_features": 12,
            "n_classes": 5,
            "class_labels": ["Class E (0)", "Class D (1)", "Class C (2)", "Class B (3)", "Class A (4)"],
            "evaluation_metrics": {
                "train_accuracy": 1.0,
                "test_accuracy": 0.9857,
                "five_fold_cv_mean": 0.8531,
                "test_split_ratio": 0.20,
                "stratified": True,
                "source": "train_model.ipynb execution log"
            },
            "features_used": [
                "Temperature", "DO", "pH", "Conductivity", "BOD", "Nitrate",
                "Fecal_Coliform", "DO_BOD_ratio", "Pollution_Index", "pH_deviation",
                "Conductivity_log", "Rule_Label_Feature"
            ],
            "dataset_records": 1868
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving model analytics: {str(e)}")
