import httpx
from datetime import datetime, timezone
from app.config import get_settings
from app.ingestion.collectors.base import BaseCollector, RawDataPoint


class RedditCollector(BaseCollector):
    source_name = "reddit"

    async def _get_access_token(self) -> str:
        settings = get_settings()
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://www.reddit.com/api/v1/access_token",
                data={"grant_type": "client_credentials"},
                auth=(settings.reddit_client_id, settings.reddit_client_secret),
                headers={"User-Agent": settings.reddit_user_agent},
            )
            resp.raise_for_status()
            return resp.json()["access_token"]

    async def collect(self, keywords: list[str] | None = None) -> list[RawDataPoint]:
        settings = get_settings()
        if not settings.reddit_client_id:
            return []

        token = await self._get_access_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "User-Agent": settings.reddit_user_agent,
        }

        data_points: list[RawDataPoint] = []

        async with httpx.AsyncClient() as client:
            # Fetch hot posts from beauty subreddits
            for subreddit in self.BEAUTY_SUBREDDITS[:5]:
                try:
                    resp = await client.get(
                        f"https://oauth.reddit.com/r/{subreddit}/hot",
                        headers=headers,
                        params={"limit": 25},
                    )
                    resp.raise_for_status()
                    posts = resp.json()["data"]["children"]

                    for post in posts:
                        d = post["data"]
                        title = d.get("title", "")
                        selftext = d.get("selftext", "")
                        content = f"{title} {selftext}".strip()

                        # Find matching beauty keywords
                        matched_keywords = []
                        content_lower = content.lower()
                        search_keywords = keywords or self.BEAUTY_KEYWORDS
                        for kw in search_keywords:
                            if kw.lower() in content_lower:
                                matched_keywords.append(kw)

                        if not matched_keywords:
                            continue

                        for kw in matched_keywords:
                            data_points.append(
                                RawDataPoint(
                                    keyword=kw,
                                    content=content[:500],
                                    source=self.source_name,
                                    author=d.get("author"),
                                    url=f"https://reddit.com{d.get('permalink', '')}",
                                    score=min(d.get("score", 0) / 10, 100),
                                    volume=1,
                                    engagement=d.get("score", 0) + d.get("num_comments", 0),
                                    hashtags=[],
                                    region="global",
                                    posted_at=datetime.fromtimestamp(d.get("created_utc", 0), tz=timezone.utc),
                                    metadata={"subreddit": subreddit, "source_id": d.get("id")},
                                )
                            )
                except httpx.HTTPError:
                    continue

        return data_points
