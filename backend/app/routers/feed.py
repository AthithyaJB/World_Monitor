from fastapi import APIRouter, Query
from app.db.supabase_client import get_supabase
from app.services.cache_service import get_cached, set_cached

router = APIRouter()


@router.get("/recent")
async def recent_feed(
    source: str | None = Query(None),
    limit: int = Query(30, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    cache_key = f"feed:{source}:{limit}:{offset}"
    cached = await get_cached(cache_key)
    if cached:
        return cached

    db = get_supabase()
    query = db.table("social_posts").select("*").order("collected_at", desc=True).limit(limit).offset(offset)

    if source:
        query = query.eq("source", source)

    result = query.execute()

    response = {
        "data": result.data,
        "meta": {"limit": limit, "offset": offset},
    }
    await set_cached(cache_key, response, ttl_seconds=60)
    return response
