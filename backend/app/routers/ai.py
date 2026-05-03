from fastapi import APIRouter, Query
from app.models.schemas import AIQueryRequest
from app.services.ai_service import query_trends, generate_report, get_recent_anomalies

router = APIRouter()


@router.post("/query")
async def ai_query(request: AIQueryRequest):
    result = await query_trends(request.query, request.region, request.category)
    return {"data": result}


@router.post("/report")
async def ai_report(
    keyword: str | None = Query(None),
    region: str | None = Query(None),
):
    result = await generate_report(keyword, region)
    return {"data": result}


@router.get("/anomalies")
async def anomalies(limit: int = Query(10, ge=1, le=50)):
    data = await get_recent_anomalies(limit)
    return {"data": data}
