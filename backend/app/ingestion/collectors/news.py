import httpx
import feedparser
from datetime import datetime, timezone
from app.config import get_settings
from app.ingestion.collectors.base import BaseCollector, RawDataPoint


class NewsCollector(BaseCollector):
    source_name = "news"

    GOOGLE_NEWS_FEEDS = [
        "https://news.google.com/rss/search?q=beauty+trends&hl=en-US",
        "https://news.google.com/rss/search?q=skincare+trends+2024&hl=en-US",
        "https://news.google.com/rss/search?q=makeup+trends&hl=en-US",
        "https://news.google.com/rss/search?q=k-beauty&hl=en-US",
    ]

    async def collect(self, keywords: list[str] | None = None) -> list[RawDataPoint]:
        data_points: list[RawDataPoint] = []

        # NewsAPI
        settings = get_settings()
        if settings.newsapi_key:
            data_points.extend(await self._collect_newsapi(settings.newsapi_key, keywords))

        # Google News RSS (no API key needed)
        data_points.extend(await self._collect_google_news(keywords))

        return data_points

    async def _collect_newsapi(self, api_key: str, keywords: list[str] | None) -> list[RawDataPoint]:
        data_points: list[RawDataPoint] = []
        search_terms = ["beauty trends", "skincare", "makeup trends", "k-beauty", "cosmetics trends"]

        async with httpx.AsyncClient() as client:
            for term in search_terms:
                try:
                    resp = await client.get(
                        "https://newsapi.org/v2/everything",
                        params={
                            "q": term,
                            "language": "en",
                            "sortBy": "publishedAt",
                            "pageSize": 10,
                            "apiKey": api_key,
                        },
                        timeout=10.0,
                    )
                    if resp.status_code != 200:
                        continue

                    articles = resp.json().get("articles", [])
                    for article in articles:
                        title = article.get("title", "")
                        description = article.get("description", "") or ""
                        content = f"{title}. {description}"

                        matched_keywords = self._extract_keywords(content, keywords)
                        if not matched_keywords:
                            matched_keywords = [term]

                        for kw in matched_keywords:
                            data_points.append(
                                RawDataPoint(
                                    keyword=kw,
                                    content=content[:500],
                                    source=self.source_name,
                                    author=article.get("author"),
                                    url=article.get("url"),
                                    score=50.0,  # News articles get a baseline score
                                    volume=1,
                                    region="global",
                                    posted_at=datetime.fromisoformat(article["publishedAt"].replace("Z", "+00:00")) if article.get("publishedAt") else None,
                                    metadata={"source_id": article.get("url"), "source_name": article.get("source", {}).get("name")},
                                )
                            )
                except httpx.HTTPError:
                    continue

        return data_points

    async def _collect_google_news(self, keywords: list[str] | None) -> list[RawDataPoint]:
        data_points: list[RawDataPoint] = []

        async with httpx.AsyncClient() as client:
            for feed_url in self.GOOGLE_NEWS_FEEDS:
                try:
                    resp = await client.get(feed_url, timeout=10.0)
                    if resp.status_code != 200:
                        continue

                    feed = feedparser.parse(resp.text)
                    for entry in feed.entries[:10]:
                        title = entry.get("title", "")
                        summary = entry.get("summary", "")
                        content = f"{title}. {summary}"

                        matched_keywords = self._extract_keywords(content, keywords)
                        if not matched_keywords:
                            matched_keywords = ["beauty trends"]

                        for kw in matched_keywords:
                            published = None
                            if hasattr(entry, "published_parsed") and entry.published_parsed:
                                published = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)

                            data_points.append(
                                RawDataPoint(
                                    keyword=kw,
                                    content=content[:500],
                                    source=self.source_name,
                                    author=None,
                                    url=entry.get("link"),
                                    score=40.0,
                                    volume=1,
                                    region="global",
                                    posted_at=published,
                                    metadata={"source_id": entry.get("link"), "source_name": "Google News"},
                                )
                            )
                except Exception:
                    continue

        return data_points

    def _extract_keywords(self, content: str, keywords: list[str] | None) -> list[str]:
        search_keywords = keywords or self.BEAUTY_KEYWORDS
        content_lower = content.lower()
        return [kw for kw in search_keywords if kw.lower() in content_lower]
