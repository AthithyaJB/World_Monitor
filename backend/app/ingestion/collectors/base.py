from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class RawDataPoint:
    keyword: str
    content: str
    source: str
    author: str | None = None
    url: str | None = None
    score: float = 0.0
    volume: int = 0
    engagement: int = 0
    hashtags: list[str] = field(default_factory=list)
    region: str = "global"
    posted_at: datetime | None = None
    metadata: dict = field(default_factory=dict)


class BaseCollector(ABC):
    source_name: str = "unknown"

    BEAUTY_KEYWORDS = [
        "skincare", "makeup", "retinol", "niacinamide", "hyaluronic acid",
        "vitamin c serum", "sunscreen", "moisturizer", "cleanser", "toner",
        "glass skin", "slugging", "skin cycling", "peptides", "ceramides",
        "lip oil", "blush", "contour", "bronzer", "mascara",
        "hair oil", "k-beauty", "j-beauty", "clean beauty", "anti-aging",
        "acne", "dark spots", "hyperpigmentation", "exfoliation", "AHA BHA",
        "collagen", "snail mucin", "salicylic acid", "benzoyl peroxide",
        "fragrance", "perfume", "nail art", "lash extensions", "microneedling",
        "dermaplaning", "LED mask", "gua sha", "jade roller", "ice roller",
    ]

    BEAUTY_SUBREDDITS = [
        "SkincareAddiction", "MakeupAddiction", "AsianBeauty",
        "BeautyGuruChatter", "Sephora", "drugstoreMUA",
        "HairCare", "curlyhair", "fragrance", "Nails",
    ]

    CATEGORY_MAP = {
        "retinol": "skincare", "niacinamide": "skincare", "hyaluronic acid": "skincare",
        "vitamin c serum": "skincare", "sunscreen": "skincare", "moisturizer": "skincare",
        "cleanser": "skincare", "toner": "skincare", "glass skin": "skincare",
        "slugging": "skincare", "skin cycling": "skincare", "peptides": "skincare",
        "ceramides": "skincare", "acne": "skincare", "dark spots": "skincare",
        "hyperpigmentation": "skincare", "exfoliation": "skincare", "AHA BHA": "skincare",
        "collagen": "skincare", "snail mucin": "skincare", "salicylic acid": "skincare",
        "benzoyl peroxide": "skincare", "anti-aging": "skincare",
        "k-beauty": "skincare", "j-beauty": "skincare", "clean beauty": "skincare",
        "lip oil": "makeup", "blush": "makeup", "contour": "makeup",
        "bronzer": "makeup", "mascara": "makeup", "makeup": "makeup",
        "hair oil": "haircare", "fragrance": "fragrance", "perfume": "fragrance",
        "nail art": "nails", "lash extensions": "makeup",
        "microneedling": "wellness", "dermaplaning": "wellness",
        "LED mask": "wellness", "gua sha": "wellness",
        "jade roller": "wellness", "ice roller": "wellness",
        "skincare": "skincare",
    }

    def categorize(self, keyword: str) -> str:
        kw_lower = keyword.lower()
        for key, cat in self.CATEGORY_MAP.items():
            if key.lower() in kw_lower:
                return cat
        return "skincare"

    @abstractmethod
    async def collect(self, keywords: list[str] | None = None) -> list[RawDataPoint]:
        pass
