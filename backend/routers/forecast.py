from fastapi import APIRouter, HTTPException, Request, Query
from typing import Optional, Dict, Any, List
import numpy as np

router = APIRouter(prefix="/api", tags=["Trend Projections"])


@router.get("/forecast")
async def get_forecast_data(request: Request, river: Optional[str] = Query("Sabarmati", description="River name for trend analysis")):
    """
    Returns authentic multi-year river water quality observations (2013–2023)
    plus statistical trend extrapolations for 2024–2025 using linear regression (numpy.polyfit),
    with clear methodology disclosures and architecture readiness notes for high-frequency IoT streaming.
    """
    try:
        data_service = request.app.state.data_service
        river_trends = data_service.river_trends

        selected_river = None
        for r_name in river_trends.keys():
            if river.lower() in r_name.lower():
                selected_river = r_name
                break

        if not selected_river:
            selected_river = list(river_trends.keys())[0]

        history = river_trends[selected_river]

        # Compute statistical linear extrapolation for future years (2024, 2025)
        # from historical observations without fabricating daily or sensor streams
        years = [h["year"] for h in history if h.get("year") is not None]
        do_vals = [h["do"] for h in history if h.get("do") is not None]
        bod_vals = [h["bod"] for h in history if h.get("bod") is not None]
        ph_vals = [h["ph"] for h in history if h.get("ph") is not None]
        cond_vals = [h.get("conductivity") for h in history if h.get("conductivity") is not None]
        nit_vals = [h.get("nitrate") for h in history if h.get("nitrate") is not None]
        fc_vals = [h.get("fecal_coliform") for h in history if h.get("fecal_coliform") is not None]

        projected = []
        if len(years) >= 3:
            last_year = max(years)
            # Fit 1-degree polynomial (linear trend)
            p_do = np.polyfit(years, do_vals, 1) if len(do_vals) == len(years) else None
            p_bod = np.polyfit(years, bod_vals, 1) if len(bod_vals) == len(years) else None
            p_ph = np.polyfit(years, ph_vals, 1) if len(ph_vals) == len(years) else None
            p_cond = np.polyfit(years, cond_vals, 1) if len(cond_vals) == len(years) else None
            p_nit = np.polyfit(years, nit_vals, 1) if len(nit_vals) == len(years) else None
            p_fc = np.polyfit(years, fc_vals, 1) if len(fc_vals) == len(years) else None

            for next_y in [last_year + 1, last_year + 2]:
                proj_do = round(float(np.clip(np.polyval(p_do, next_y), 1.0, 14.0)), 2) if p_do is not None else None
                proj_bod = round(float(np.clip(np.polyval(p_bod, next_y), 0.5, 30.0)), 2) if p_bod is not None else None
                proj_ph = round(float(np.clip(np.polyval(p_ph, next_y), 6.0, 9.0)), 2) if p_ph is not None else None
                proj_cond = round(float(np.clip(np.polyval(p_cond, next_y), 50.0, 3000.0)), 1) if p_cond is not None else None
                proj_nit = round(float(np.clip(np.polyval(p_nit, next_y), 0.1, 50.0)), 2) if p_nit is not None else None
                proj_fc = round(float(np.clip(np.polyval(p_fc, next_y), 10.0, 25000.0)), 1) if p_fc is not None else None

                projected.append({
                    "year": next_y,
                    "do": proj_do,
                    "bod": proj_bod,
                    "ph": proj_ph,
                    "conductivity": proj_cond,
                    "nitrate": proj_nit,
                    "fecal_coliform": proj_fc,
                    "is_projected": True,
                    "method": "Linear Trend Extrapolation"
                })

        return {
            "river": selected_river,
            "available_rivers": list(river_trends.keys()),
            "historical_period": f"{min(years)} – {max(years)}" if years else "2013 – 2023",
            "historical_years": f"{min(years)} – {max(years)}" if years else "2013 – 2023",
            "projected_period": f"{max(years)+1} – {max(years)+2}" if years else "2024 – 2025",
            "methodology_note": "Projected values are statistical trend extrapolations from historical observations and should not be interpreted as certified forecasts.",
            "historical_data": history,
            "projected_data": projected,
            "iot_architecture": {
                "status": "Architecture Ready (Future Capability)",
                "notice": "The current machine learning model is an explainable Random Forest classifier trained on tabular monitoring records. High-frequency time-series forecasting (Next-Day, 7-Day, 30-Day trend horizons) will activate when continuous IoT sensor telemetry streams are linked.",
                "supported_horizons": [
                    {"horizon": "Next-Day", "status": "Ready for Telemetry Stream"},
                    {"horizon": "7-Day Forecast", "status": "Ready for Telemetry Stream"},
                    {"horizon": "30-Day Trend", "status": "Ready for Telemetry Stream"}
                ]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error computing forecast trend: {str(e)}")
