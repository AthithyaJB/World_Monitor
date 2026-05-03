from fastapi import APIRouter, Query
from datetime import datetime, timedelta, timezone
from app.db.supabase_client import get_supabase
from app.services.cache_service import get_cached, set_cached

router = APIRouter()


@router.get("/timeseries")
async def timeseries(
    keyword: str = Query(...),
    region: str = Query("global"),
    period: str = Query("hourly"),
    days: int = Query(7, ge=1, le=30),
):
    cache_key = f"analytics:ts:{keyword}:{region}:{period}:{days}"
    cached = await get_cached(cache_key)
    if cached:
        return cached

    db = get_supabase()
    since = datetime.now(timezone.utc) - timedelta(days=days)

    result = (
        db.table("trend_snapshots")
        .select("*")
        .eq("keyword", keyword)
        .eq("region", region)
        .eq("period", period)
        .gte("period_start", since.isoformat())
        .order("period_start", desc=False)
        .execute()
    )

    response = {"data": result.data}
    await set_cached(cache_key, response, ttl_seconds=300)
    return response


@router.get("/sentiment")
async def sentiment_over_time(
    keyword: str | None = Query(None),
    category: str | None = Query(None),
    days: int = Query(7, ge=1, le=30),
):
    cache_key = f"analytics:sentiment:{keyword}:{category}:{days}"
    cached = await get_cached(cache_key)
    if cached:
        return cached

    db = get_supabase()
    since = datetime.now(timezone.utc) - timedelta(days=days)

    query = (
        db.table("trend_snapshots")
        .select("period_start, avg_sentiment, keyword, category")
        .eq("period", "daily")
        .gte("period_start", since.isoformat())
        .order("period_start", desc=False)
    )

    if keyword:
        query = query.eq("keyword", keyword)
    if category:
        query = query.eq("category", category)

    result = query.execute()

    response = {"data": result.data}
    await set_cached(cache_key, response, ttl_seconds=300)
    return response


@router.get("/categories")
async def category_breakdown():
    cache_key = "analytics:categories"
    cached = await get_cached(cache_key)
    if cached:
        return cached

    db = get_supabase()
    since = datetime.now(timezone.utc) - timedelta(hours=24)

    result = db.table("trends").select("category, score").gte("collected_at", since.isoformat()).execute()

    categories: dict[str, dict] = {}
    for row in result.data:
        cat = row["category"]
        if cat not in categories:
            categories[cat] = {"category": cat, "count": 0, "total_score": 0}
        categories[cat]["count"] += 1
        categories[cat]["total_score"] += row["score"]

    breakdown = [
        {
            "category": v["category"],
            "count": v["count"],
            "avg_score": round(v["total_score"] / v["count"], 1) if v["count"] > 0 else 0,
        }
        for v in categories.values()
    ]
    breakdown.sort(key=lambda x: x["count"], reverse=True)

    response = {"data": breakdown}
    await set_cached(cache_key, response, ttl_seconds=300)
    return response
