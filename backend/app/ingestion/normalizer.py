from datetime import datetime, timezone
from app.ingestion.collectors.base import RawDataPoint, BaseCollector


_categorizer = BaseCollector.__new__(BaseCollector)


def normalize_to_trend(point: RawDataPoint) -> dict:
    return {
        "keyword": point.keyword.lower().strip(),
        "category": _categorizer.categorize(point.keyword),
        "region": _normalize_region(point.region),
        "source": point.source,
        "score": max(0, min(100, point.score)),
        "volume": max(0, point.volume),
        "sentiment": None,
        "metadata": point.metadata,
        "collected_at": datetime.now(timezone.utc).isoformat(),
    }


def normalize_to_social_post(point: RawDataPoint) -> dict:
    return {
        "source": point.source,
        "source_id": point.metadata.get("source_id"),
        "author": point.author,
        "content": point.content[:1000],
        "url": point.url,
        "hashtags": point.hashtags,
        "keywords": [point.keyword.lower().strip()],
        "sentiment": None,
        "engagement": point.engagement,
        "region": _normalize_region(point.region),
        "posted_at": point.posted_at.isoformat() if point.posted_at else None,
        "collected_at": datetime.now(timezone.utc).isoformat(),
    }


def normalize_to_product(point: RawDataPoint) -> dict:
    meta = point.metadata
    return {
        "name": point.content[:200],
        "brand": point.author,
        "category": _categorizer.categorize(point.keyword),
        "ingredients": [],
        "image_url": meta.get("image_url"),
        "source": point.source,
        "source_url": point.url,
        "price": _parse_price(meta.get("price")),
        "currency": "USD",
        "rating": float(meta["rating"]) if meta.get("rating") else None,
        "review_count": point.volume,
        "trend_score": point.score,
        "rank": meta.get("rank"),
        "rank_change": 0,
        "region": _normalize_region(point.region),
        "collected_at": datetime.now(timezone.utc).isoformat(),
    }


def _normalize_region(region: str) -> str:
    region_map = {
        "united states": "US", "usa": "US", "us": "US",
        "united kingdom": "GB", "uk": "GB", "gb": "GB",
        "south korea": "KR", "korea": "KR",
        "japan": "JP", "china": "CN", "india": "IN",
        "france": "FR", "germany": "DE", "brazil": "BR",
        "canada": "CA", "australia": "AU", "italy": "IT",
        "spain": "ES", "mexico": "MX", "indonesia": "ID",
        "thailand": "TH", "singapore": "SG", "malaysia": "MY",
        "philippines": "PH", "vietnam": "VN", "taiwan": "TW",
    }
    if len(region) == 2:
        return region.upper()
    return region_map.get(region.lower(), region)


def _parse_price(price_str: str | None) -> float | None:
    if not price_str:
        return None
    try:
        cleaned = "".join(c for c in price_str if c.isdigit() or c == ".")
        return float(cleaned) if cleaned else None
    except (ValueError, TypeError):
        return None
