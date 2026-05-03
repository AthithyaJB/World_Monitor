from datetime import datetime, timedelta, timezone
from app.db.supabase_client import get_supabase
from app.services.cache_service import get_cached, set_cached


async def get_trends(
    category: str | None = None,
    region: str | None = None,
    source: str | None = None,
    since_hours: int = 24,
    limit: int = 50,
    offset: int = 0,
) -> dict:
    cache_key = f"trends:{category}:{region}:{source}:{since_hours}:{limit}:{offset}"
    cached = await get_cached(cache_key)
    if cached:
        return cached

    db = get_supabase()
    since = datetime.now(timezone.utc) - timedelta(hours=since_hours)

    query = db.table("trends").select("*").gte("collected_at", since.isoformat()).order("score", desc=True).limit(limit).offset(offset)

    if category:
        query = query.eq("category", category)
    if region:
        query = query.eq("region", region)
    if source:
        query = query.eq("source", source)

    result = query.execute()

    # Get total count
    count_query = db.table("trends").select("id", count="exact").gte("collected_at", since.isoformat())
    if category:
        count_query = count_query.eq("category", category)
    if region:
        count_query = count_query.eq("region", region)
    if source:
        count_query = count_query.eq("source", source)
    count_result = count_query.execute()

    response = {
        "data": result.data,
        "meta": {"total": count_result.count or 0, "limit": limit, "offset": offset},
    }
    await set_cached(cache_key, response, ttl_seconds=120)
    return response


async def get_trend_map_data() -> list[dict]:
    cache_key = "trends:map"
    cached = await get_cached(cache_key)
    if cached:
        return cached

    db = get_supabase()
    since = datetime.now(timezone.utc) - timedelta(hours=24)

    result = db.table("trends").select("region, score, volume, keyword").gte("collected_at", since.isoformat()).neq("region", "global").execute()

    region_data: dict[str, dict] = {}
    for row in result.data:
        r = row["region"]
        if r not in region_data:
            region_data[r] = {"region": r, "scores": [], "total_volume": 0, "keywords": {}}
        region_data[r]["scores"].append(row["score"])
        region_data[r]["total_volume"] += row.get("volume", 0)
        kw = row["keyword"]
        region_data[r]["keywords"][kw] = region_data[r]["keywords"].get(kw, 0) + row["score"]

    map_points = []
    for r, data in region_data.items():
        sorted_kw = sorted(data["keywords"].items(), key=lambda x: x[1], reverse=True)
        map_points.append({
            "region": r,
            "avg_score": sum(data["scores"]) / len(data["scores"]) if data["scores"] else 0,
            "total_volume": data["total_volume"],
            "top_keywords": [kw for kw, _ in sorted_kw[:5]],
        })

    await set_cached(cache_key, map_points, ttl_seconds=300)
    return map_points


async def get_top_trends(limit: int = 20) -> list[dict]:
    cache_key = f"trends:top:{limit}"
    cached = await get_cached(cache_key)
    if cached:
        return cached

    db = get_supabase()
    now = datetime.now(timezone.utc)
    current_period = now - timedelta(hours=24)
    previous_period = now - timedelta(hours=48)

    current = db.table("trends").select("keyword, category, score, volume, sentiment").gte("collected_at", current_period.isoformat()).execute()
    previous = db.table("trends").select("keyword, score").gte("collected_at", previous_period.isoformat()).lt("collected_at", current_period.isoformat()).execute()

    # Aggregate current period
    current_agg: dict[str, dict] = {}
    for row in current.data:
        kw = row["keyword"]
        if kw not in current_agg:
            current_agg[kw] = {"keyword": kw, "category": row["category"], "scores": [], "volumes": [], "sentiments": []}
        current_agg[kw]["scores"].append(row["score"])
        current_agg[kw]["volumes"].append(row.get("volume", 0))
        if row.get("sentiment") is not None:
            current_agg[kw]["sentiments"].append(row["sentiment"])

    # Aggregate previous period
    prev_agg: dict[str, float] = {}
    for row in previous.data:
        kw = row["keyword"]
        prev_agg.setdefault(kw, [])
        prev_agg[kw].append(row["score"])

    top = []
    for kw, data in current_agg.items():
        avg_score = sum(data["scores"]) / len(data["scores"])
        prev_scores = prev_agg.get(kw, [])
        prev_avg = sum(prev_scores) / len(prev_scores) if prev_scores else 0
        change = ((avg_score - prev_avg) / prev_avg * 100) if prev_avg > 0 else 100.0

        top.append({
            "keyword": kw,
            "category": data["category"],
            "score": round(avg_score, 1),
            "volume": sum(data["volumes"]),
            "change": round(change, 1),
            "sentiment": round(sum(data["sentiments"]) / len(data["sentiments"]), 2) if data["sentiments"] else None,
        })

    top.sort(key=lambda x: x["score"], reverse=True)
    top = top[:limit]

    await set_cached(cache_key, top, ttl_seconds=300)
    return top
