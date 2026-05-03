import httpx
from datetime import datetime, timezone
from app.config import get_settings
from app.ingestion.collectors.base import BaseCollector, RawDataPoint


class TwitterCollector(BaseCollector):
    source_name = "twitter"

    async def collect(self, keywords: list[str] | None = None) -> list[RawDataPoint]:
        settings = get_settings()
        if not settings.twitter_bearer_token:
            return []

        headers = {"Authorization": f"Bearer {settings.twitter_bearer_token}"}
        data_points: list[RawDataPoint] = []
        search_keywords = keywords or self.BEAUTY_KEYWORDS[:15]

        async with httpx.AsyncClient() as client:
            for kw in search_keywords:
                try:
                    resp = await client.get(
                        "https://api.twitter.com/2/tweets/search/recent",
                        headers=headers,
                        params={
                            "query": f"{kw} -is:retweet lang:en",
                            "max_results": 10,
                            "tweet.fields": "created_at,public_metrics,author_id,geo",
                        },
                    )
                    if resp.status_code != 200:
                        continue

                    tweets = resp.json().get("data", [])
                    for tweet in tweets:
                        metrics = tweet.get("public_metrics", {})
                        engagement = (
                            metrics.get("like_count", 0)
                            + metrics.get("retweet_count", 0)
                            + metrics.get("reply_count", 0)
                        )
                        data_points.append(
                            RawDataPoint(
                                keyword=kw,
                                content=tweet.get("text", "")[:500],
                                source=self.source_name,
                                author=tweet.get("author_id"),
                                url=f"https://twitter.com/i/web/status/{tweet['id']}",
                                score=min(engagement / 5, 100),
                                volume=1,
                                engagement=engagement,
                                region="global",
                                posted_at=datetime.fromisoformat(tweet["created_at"].replace("Z", "+00:00")) if tweet.get("created_at") else None,
                                metadata={"source_id": tweet["id"]},
                            )
                        )
                except httpx.HTTPError:
                    continue

        return data_points
