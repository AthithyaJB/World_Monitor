from fastapi import APIRouter, Query
from app.services.trend_service import get_trends, get_trend_map_data, get_top_trends

router = APIRouter()


@router.get("")
async def list_trends(
    category: str | None = Query(None),
    region: str | None = Query(None),
    source: str | None = Query(None),
    since_hours: int = Query(24, ge=1, le=168),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    return await get_trends(category, region, source, since_hours, limit, offset)


@router.get("/map")
async def trend_map():
    data = await get_trend_map_data()
    return {"data": data}


@router.get("/top")
async def top_trends(limit: int = Query(20, ge=1, le=100)):
    data = await get_top_trends(limit)
    return {"data": data}
