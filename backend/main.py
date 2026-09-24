import os
import sys
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from services.predictor import PredictorService
from services.data_service import DataService
from routers import predict, dataset, analytics, stations, forecast

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("AquaSenseBackend")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "scaler.pkl")
EXCEL_PATH = os.path.join(BASE_DIR, "water_quality.xlsx")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing AquaSense Water Quality Backend...")
    try:
        # Load ML Engine singleton
        logger.info(f"Loading Model from {MODEL_PATH}")
        logger.info(f"Loading Scaler from {SCALER_PATH}")
        predictor = PredictorService(MODEL_PATH, SCALER_PATH)
        app.state.predictor = predictor
        logger.info("ML Engine successfully loaded and verified.")

        # Load Dataset singleton
        logger.info(f"Loading Water Quality Dataset from {EXCEL_PATH}")
        data_service = DataService(EXCEL_PATH)
        app.state.data_service = data_service
        logger.info(f"Dataset successfully loaded: {len(data_service.df)} records across {data_service.kpis.num_rivers} rivers.")
    except Exception as e:
        logger.error(f"Fatal error during startup initialization: {str(e)}", exc_info=True)
        raise e

    yield

    logger.info("Shutting down AquaSense Backend...")


app = FastAPI(
    title="AquaSense — River Water Quality Intelligence API",
    description="Regulatory CPCB Rule Engine & Random Forest Machine Learning Platform for River Water Quality Assessment and Analysis.",
    version="2.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred while processing your request. Please check input parameters or try again.",
            "path": request.url.path
        }
    )

# Include Routers
app.include_router(predict.router)
app.include_router(dataset.router)
app.include_router(analytics.router)
app.include_router(stations.router)
app.include_router(forecast.router)


@app.get("/")
async def root():
    return {
        "platform": "AquaSense River Water Quality Intelligence Platform",
        "version": "2.0.0",
        "description": "Hybrid CPCB Standards & Random Forest ML System",
        "documentation": "/docs",
        "health_check": "/api/health"
    }


@app.get("/api/health")
async def health_check(request: Request):
    """
    Health check verifying ML Engine, Scaler, and Dataset status.
    """
    try:
        predictor_loaded = hasattr(request.app.state, "predictor") and request.app.state.predictor is not None
        data_loaded = hasattr(request.app.state, "data_service") and request.app.state.data_service is not None
        record_count = len(request.app.state.data_service.df) if data_loaded else 0

        return {
            "status": "online",
            "ml_engine": "online" if predictor_loaded else "offline",
            "model_type": "Random Forest Classifier (300 estimators, max_depth 15)",
            "scaler_status": "loaded" if predictor_loaded else "offline",
            "dataset_status": "ready" if data_loaded else "offline",
            "dataset_records": record_count,
            "cpcb_rule_engine": "active",
            "python_version": sys.version.split()[0],
            "api_version": "2.0.0"
        }
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={"status": "degraded", "detail": str(e)}
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
