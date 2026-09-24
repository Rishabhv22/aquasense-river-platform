from fastapi import APIRouter, HTTPException, Request, Query
from typing import Optional, List
from schemas.dataset import StationCard

router = APIRouter(prefix="/api", tags=["Monitoring Stations"])


@router.get("/stations", response_model=List[StationCard])
async def get_stations(
    request: Request,
    river: Optional[str] = Query(None, description="Filter stations by river"),
    status: Optional[str] = Query(None, description="Filter by status (Online, Offline, Periodic Telemetry)"),
    limit: int = Query(60, ge=1, le=400, description="Max stations to return")
):
    """
    Returns monitoring station cards with their latest recorded environmental readings,
    CPCB classification, and live telemetry connection status.
    """
    try:
        stations = request.app.state.data_service.stations
        res = stations
        if river:
            r = river.lower()
            res = [s for s in res if r in s.river_name.lower()]
        if status:
            res = [s for s in res if s.status.lower() == status.lower()]
        return res[:limit]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving stations: {str(e)}")


@router.get("/stations/map")
async def get_mapped_stations(request: Request):
    """
    Returns all monitoring stations that have valid geographic coordinates for map visualization.
    """
    try:
        stations = request.app.state.data_service.stations
        mapped = [s for s in stations if s.latitude is not None and s.longitude is not None]
        unmapped_count = len(stations) - len(mapped)
        return {
            "stations": mapped,
            "total_stations": len(stations),
            "mapped_count": len(mapped),
            "unmapped_count": unmapped_count,
            "notice": "Mapped stations represent key river monitoring hubs with calibrated GPS coordinates. Remaining stations require coordinate linking."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving map stations: {str(e)}")


@router.get("/stations/{station_code}", response_model=StationCard)
async def get_station_by_code(station_code: str, request: Request):
    """
    Retrieves a single monitoring station by its station code.
    """
    try:
        stations = request.app.state.data_service.stations
        for s in stations:
            if s.station_code == station_code:
                return s
        raise HTTPException(status_code=404, detail=f"Station code {station_code} not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving station: {str(e)}")
