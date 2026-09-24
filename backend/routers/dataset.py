from fastapi import APIRouter, HTTPException, Request, Query
from fastapi.responses import StreamingResponse
from typing import Optional
import io
import csv
from schemas.dataset import DatasetQueryResponse

router = APIRouter(prefix="/api", tags=["Dataset"])


@router.get("/dataset", response_model=DatasetQueryResponse)
async def get_dataset(
    request: Request,
    search: Optional[str] = Query(None, description="Search keyword in River, Location, State, Station"),
    river: Optional[str] = Query(None, description="Filter by River name"),
    state: Optional[str] = Query(None, description="Filter by State"),
    year: Optional[int] = Query(None, description="Filter by Year"),
    cpcb_class: Optional[str] = Query(None, description="Filter by CPCB Class Code (e.g. Class A, Class B)"),
    sort_by: Optional[str] = Query("id", description="Field to sort by"),
    sort_order: Optional[str] = Query("asc", pattern="^(asc|desc)$", description="Sort order"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Records per page")
):
    """
    Searchable, filterable, and paginated historical water quality observations from the CPCB dataset.
    """
    try:
        data_service = request.app.state.data_service
        return data_service.query_dataset(
            search=search,
            river=river,
            state=state,
            year=year,
            cpcb_class=cpcb_class,
            sort_by=sort_by,
            sort_order=sort_order,
            page=page,
            page_size=page_size
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error querying dataset: {str(e)}")


@router.get("/dataset/filters")
async def get_dataset_filters(request: Request):
    """
    Returns unique values available for filtering (Rivers, States, Years, CPCB Classes).
    """
    try:
        df = request.app.state.data_service.df
        rivers = sorted([
            "Yamuna" if r.lower() == "yanuma" else r
            for r in df['River_Name'].dropna().unique()
        ])
        # Deduplicate
        rivers = sorted(list(set(rivers)))
        states = sorted([str(s).title() for s in df['State_Name'].dropna().unique() if str(s).strip()])
        years = sorted([int(y) for y in df['Year'].dropna().unique()])
        classes = ["Class A", "Class B", "Class C", "Class D", "Class E"]

        return {
            "rivers": rivers,
            "states": states,
            "years": years,
            "classes": classes
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving filter values: {str(e)}")


@router.get("/dataset/export")
async def export_dataset_csv(request: Request):
    """
    Exports clean dataset as a downloadable CSV.
    """
    try:
        df = request.app.state.data_service.df.copy()
        output = io.StringIO()
        df.to_csv(output, index=False)
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=river_water_quality_cpcb.csv"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")
