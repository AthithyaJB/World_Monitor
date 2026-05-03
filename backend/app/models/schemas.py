from pydantic import BaseModel
from datetime import datetime


class TrendResponse(BaseModel):
    id: str
    keyword: str
    category: str
    subcategory: str | None = None
    region: str
    source: str
    score: float
    volume: int
    sentiment: float | None = None
    collected_at: datetime


class TrendMapPoint(BaseModel):
    region: str
    avg_score: float
    total_volume: int
    top_keywords: list[str]


class TopTrend(BaseModel):
    keyword: str
    category: str
    score: float
    volume: int
    change: float  # percentage change from previous period
    sentiment: float | None = None


class SocialPostResponse(BaseModel):
    id: str
    source: str
    author: str | None = None
    content: str
    url: str | None = None
    hashtags: list[str]
    keywords: list[str]
    sentiment: float | None = None
    engagement: int
    region: str
    posted_at: datetime | None = None
    collected_at: datetime


class ProductResponse(BaseModel):
    id: str
    name: str
    brand: str | None = None
    category: str
    ingredients: list[str]
    image_url: str | None = None
    source: str
    source_url: str | None = None
    price: float | None = None
    currency: str
    rating: float | None = None
    review_count: int
    trend_score: float
    rank: int | None = None
    rank_change: int
    region: str


class AIQueryRequest(BaseModel):
    query: str
    region: str | None = None
    category: str | None = None


class AIInsightResponse(BaseModel):
    id: str
    type: str
    title: str
    content: str
    keywords: list[str]
    region: str
    confidence: float | None = None
    created_at: datetime


class TimeSeriesPoint(BaseModel):
    period_start: datetime
    avg_score: float
    total_volume: int
    avg_sentiment: float | None = None


class CategoryBreakdown(BaseModel):
    category: str
    count: int
    avg_score: float


class IngestTriggerRequest(BaseModel):
    job_type: str = "standard"  # standard, google_trends, ecommerce, daily_report


class PaginatedResponse(BaseModel):
    data: list
    meta: dict
