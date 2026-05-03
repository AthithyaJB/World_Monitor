import asyncio
from datetime import datetime, timezone

from app.db.supabase_client import get_supabase
from app.ingestion.collectors.reddit import RedditCollector
from app.ingestion.collectors.twitter import TwitterCollector
from app.ingestion.collectors.tiktok import TikTokCollector
from app.ingestion.collectors.google_trends import GoogleTrendsCollector
from app.ingestion.collectors.ecommerce import EcommerceCollector
from app.ingestion.collectors.news import NewsCollector
from app.ingestion.normalizer import normalize_to_trend, normalize_to_social_post, normalize_to_product
from app.ingestion.sentiment import analyze_sentiment_batch
from app.services.cache_service import invalidate


JOB_COLLECTORS = {
    "standard": [RedditCollector, TwitterCollector, NewsCollector],
    "google_trends": [GoogleTrendsCollector],
    "ecommerce": [EcommerceCollector, TikTokCollector],
    "full": [RedditCollector, TwitterCollector, TikTokCollector, GoogleTrendsCollector, EcommerceCollector, NewsCollector],
}


async def run_ingestion(job_type: str = "standard") -> dict:
    collector_classes = JOB_COLLECTORS.get(job_type, JOB_COLLECTORS["standard"])
    collectors = [cls() for cls in collector_classes]

    # Run all collectors concurrently
    results = await asyncio.gather(
        *[collector.collect() for collector in collectors],
        return_exceptions=True,
    )

    db = get_supabase()
    stats = {"trends_inserted": 0, "posts_inserted": 0, "products_inserted": 0, "errors": 0}

    for result in results:
        if isinstance(result, Exception):
            stats["errors"] += 1
            continue

        for point in result:
            try:
                # Insert trend data
                trend = normalize_to_trend(point)
                db.table("trends").insert(trend).execute()
                stats["trends_inserted"] += 1

                # Insert social post (for social sources)
                if point.source in ("reddit", "twitter", "tiktok", "news"):
                    post = normalize_to_social_post(point)
                    db.table("social_posts").upsert(post, on_conflict="source,source_id").execute()
                    stats["posts_inserted"] += 1

                # Insert product data
                if point.metadata.get("is_product"):
                    product = normalize_to_product(point)
                    db.table("products").upsert(product, on_conflict="source,name,brand,region").execute()
                    stats["products_inserted"] += 1

            except Exception:
                stats["errors"] += 1

    # Run sentiment analysis on new posts
    try:
        sentiment_count = await analyze_sentiment_batch()
        stats["sentiment_analyzed"] = sentiment_count
    except Exception:
        pass

    # Aggregate snapshots
    try:
        await aggregate_snapshots()
    except Exception:
        pass

    # Invalidate relevant caches
    await invalidate("trends:*")
    await invalidate("feed:*")
    await invalidate("products:*")
    await invalidate("analytics:*")

    return stats


async def aggregate_snapshots() -> None:
    db = get_supabase()
    now = datetime.now(timezone.utc)

    # Get recent trends for hourly snapshot
    result = db.table("trends").select("keyword, category, region, source, score, volume, sentiment").gte(
        "collected_at", now.replace(minute=0, second=0, microsecond=0).isoformat()
    ).execute()

    if not result.data:
        return

    # Aggregate by keyword + region
    agg: dict[tuple, dict] = {}
    for row in result.data:
        key = (row["keyword"], row["category"], row["region"])
        if key not in agg:
            agg[key] = {"scores": [], "volumes": [], "sentiments": [], "sources": {}}
        agg[key]["scores"].append(row["score"])
        agg[key]["volumes"].append(row.get("volume", 0))
        if row.get("sentiment") is not None:
            agg[key]["sentiments"].append(row["sentiment"])
        src = row["source"]
        agg[key]["sources"][src] = agg[key]["sources"].get(src, 0) + 1

    period_start = now.replace(minute=0, second=0, microsecond=0).isoformat()

    for (keyword, category, region), data in agg.items():
        snapshot = {
            "keyword": keyword,
            "category": category,
            "region": region,
            "period": "hourly",
            "period_start": period_start,
            "avg_score": round(sum(data["scores"]) / len(data["scores"]), 2),
            "total_volume": sum(data["volumes"]),
            "avg_sentiment": round(sum(data["sentiments"]) / len(data["sentiments"]), 3) if data["sentiments"] else None,
            "source_breakdown": data["sources"],
        }

        try:
            db.table("trend_snapshots").upsert(snapshot, on_conflict="keyword,region,period,period_start").execute()
        except Exception:
            continue
