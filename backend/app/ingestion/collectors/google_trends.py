import asyncio
from pytrends.request import TrendReq
from app.ingestion.collectors.base import BaseCollector, RawDataPoint


class GoogleTrendsCollector(BaseCollector):
    source_name = "google_trends"

    async def collect(self, keywords: list[str] | None = None) -> list[RawDataPoint]:
        search_keywords = keywords or self.BEAUTY_KEYWORDS[:20]
        data_points: list[RawDataPoint] = []

        # pytrends is synchronous, run in executor
        loop = asyncio.get_event_loop()
        data_points = await loop.run_in_executor(None, self._collect_sync, search_keywords)
        return data_points

    def _collect_sync(self, keywords: list[str]) -> list[RawDataPoint]:
        data_points: list[RawDataPoint] = []

        try:
            pytrends = TrendReq(hl="en-US", tz=360)

            # Process in batches of 5 (pytrends limit)
            for i in range(0, len(keywords), 5):
                batch = keywords[i : i + 5]
                try:
                    pytrends.build_payload(batch, cat=0, timeframe="now 7-d")

                    # Interest over time
                    interest = pytrends.interest_over_time()
                    if not interest.empty:
                        for kw in batch:
                            if kw in interest.columns:
                                avg_interest = interest[kw].mean()
                                data_points.append(
                                    RawDataPoint(
                                        keyword=kw,
                                        content=f"Google Trends interest for '{kw}': {avg_interest:.1f}/100",
                                        source=self.source_name,
                                        score=float(avg_interest),
                                        volume=int(avg_interest * 100),
                                        region="global",
                                    )
                                )

                    # Interest by region
                    try:
                        region_data = pytrends.interest_by_region(resolution="COUNTRY")
                        if not region_data.empty:
                            for kw in batch:
                                if kw in region_data.columns:
                                    top_regions = region_data[kw].nlargest(10)
                                    for region_name, value in top_regions.items():
                                        if value > 0:
                                            data_points.append(
                                                RawDataPoint(
                                                    keyword=kw,
                                                    content=f"Google Trends: '{kw}' interest in {region_name}: {value}/100",
                                                    source=self.source_name,
                                                    score=float(value),
                                                    volume=int(value * 10),
                                                    region=str(region_name),
                                                )
                                            )
                    except Exception:
                        pass

                except Exception:
                    continue

        except Exception:
            pass

        return data_points
