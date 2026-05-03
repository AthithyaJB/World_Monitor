import httpx
from app.config import get_settings
from app.ingestion.collectors.base import BaseCollector, RawDataPoint


class EcommerceCollector(BaseCollector):
    source_name = "ecommerce"

    async def collect(self, keywords: list[str] | None = None) -> list[RawDataPoint]:
        settings = get_settings()
        if not settings.rapidapi_key:
            return []

        search_keywords = keywords or [
            "retinol serum", "vitamin c serum", "hyaluronic acid",
            "niacinamide serum", "sunscreen SPF 50", "snail mucin",
            "salicylic acid cleanser", "peptide cream", "lip oil",
            "hair oil treatment",
        ]

        data_points: list[RawDataPoint] = []

        async with httpx.AsyncClient() as client:
            for kw in search_keywords:
                try:
                    resp = await client.get(
                        "https://real-time-amazon-data.p.rapidapi.com/search",
                        headers={
                            "X-RapidAPI-Key": settings.rapidapi_key,
                            "X-RapidAPI-Host": "real-time-amazon-data.p.rapidapi.com",
                        },
                        params={"query": kw, "page": "1", "country": "US", "category_id": "aps"},
                        timeout=15.0,
                    )
                    if resp.status_code != 200:
                        continue

                    products = resp.json().get("data", {}).get("products", [])
                    for idx, product in enumerate(products[:5]):
                        rating = product.get("product_star_rating")
                        reviews = product.get("product_num_ratings", 0)

                        data_points.append(
                            RawDataPoint(
                                keyword=kw,
                                content=product.get("product_title", "")[:500],
                                source=self.source_name,
                                author=product.get("product_by"),
                                url=product.get("product_url"),
                                score=float(rating or 0) * 20,  # Convert 5-star to 0-100
                                volume=reviews or 0,
                                engagement=reviews or 0,
                                region="US",
                                metadata={
                                    "source_id": product.get("asin"),
                                    "price": product.get("product_price"),
                                    "image_url": product.get("product_photo"),
                                    "rating": rating,
                                    "rank": idx + 1,
                                    "is_product": True,
                                },
                            )
                        )
                except httpx.HTTPError:
                    continue

        return data_points
