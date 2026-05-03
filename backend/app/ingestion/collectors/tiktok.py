import httpx
from datetime import datetime, timezone
from app.config import get_settings
from app.ingestion.collectors.base import BaseCollector, RawDataPoint


class TikTokCollector(BaseCollector):
    source_name = "tiktok"

    async def collect(self, keywords: list[str] | None = None) -> list[RawDataPoint]:
        settings = get_settings()
        if not settings.rapidapi_key:
            return []

        headers = {
            "X-RapidAPI-Key": settings.rapidapi_key,
            "X-RapidAPI-Host": "tiktok-scraper7.p.rapidapi.com",
        }

        data_points: list[RawDataPoint] = []
        search_keywords = keywords or self.BEAUTY_KEYWORDS[:10]

        async with httpx.AsyncClient() as client:
            for kw in search_keywords:
                try:
                    resp = await client.get(
                        "https://tiktok-scraper7.p.rapidapi.com/feed/search",
                        headers=headers,
                        params={"keywords": kw, "count": 10, "region": "US"},
                        timeout=15.0,
                    )
                    if resp.status_code != 200:
                        continue

                    videos = resp.json().get("data", {}).get("videos", [])
                    for video in videos:
                        stats = video.get("stats", {})
                        engagement = (
                            stats.get("diggCount", 0)
                            + stats.get("commentCount", 0)
                            + stats.get("shareCount", 0)
                        )

                        data_points.append(
                            RawDataPoint(
                                keyword=kw,
                                content=video.get("desc", "")[:500],
                                source=self.source_name,
                                author=video.get("author", {}).get("uniqueId"),
                                url=f"https://www.tiktok.com/@{video.get('author', {}).get('uniqueId', '')}/video/{video.get('id', '')}",
                                score=min(engagement / 100, 100),
                                volume=1,
                                engagement=engagement,
                                hashtags=[tag.get("title", "") for tag in video.get("textExtra", []) if tag.get("hashtagName")],
                                region=video.get("locationCreated", "global"),
                                posted_at=datetime.fromtimestamp(video.get("createTime", 0), tz=timezone.utc) if video.get("createTime") else None,
                                metadata={"source_id": video.get("id"), "play_count": stats.get("playCount", 0)},
                            )
                        )
                except httpx.HTTPError:
                    continue

        return data_points
