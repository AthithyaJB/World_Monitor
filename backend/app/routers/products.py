from fastapi import APIRouter, Query
from app.db.supabase_client import get_supabase
from app.services.cache_service import get_cached, set_cached

router = APIRouter()


@router.get("/rankings")
async def product_rankings(
    category: str | None = Query(None),
    region: str | None = Query(None),
    sort_by: str = Query("trend_score"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    cache_key = f"products:{category}:{region}:{sort_by}:{limit}:{offset}"
    cached = await get_cached(cache_key)
    if cached:
        return cached

    db = get_supabase()
    query = db.table("products").select("*").order(sort_by, desc=True).limit(limit).offset(offset)

    if category:
        query = query.eq("category", category)
    if region:
        query = query.eq("region", region)

    result = query.execute()

    count_query = db.table("products").select("id", count="exact")
    if category:
        count_query = count_query.eq("category", category)
    if region:
        count_query = count_query.eq("region", region)
    count_result = count_query.execute()

    response = {
        "data": result.data,
        "meta": {"total": count_result.count or 0, "limit": limit, "offset": offset},
    }
    await set_cached(cache_key, response, ttl_seconds=600)
    return response


@router.get("/{product_id}")
async def get_product(product_id: str):
    db = get_supabase()
    result = db.table("products").select("*").eq("id", product_id).single().execute()
    return {"data": result.data}
