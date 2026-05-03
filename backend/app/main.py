from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.db.supabase_client import init_supabase, get_supabase
from app.services.cache_service import init_redis
from app.routers import trends, products, feed, analytics, ai, ingest


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    init_supabase(settings.supabase_url, settings.supabase_service_key)
    init_redis(settings.upstash_redis_url, settings.upstash_redis_token)
    yield


app = FastAPI(
    title="Beauty Trends World Monitor",
    description="Real-time global beauty trend monitoring API",
    version="1.0.0",
    lifespan=lifespan,
)

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(trends.router, prefix="/api/v1/trends", tags=["trends"])
app.include_router(products.router, prefix="/api/v1/products", tags=["products"])
app.include_router(feed.router, prefix="/api/v1/feed", tags=["feed"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])
app.include_router(ai.router, prefix="/api/v1/ai", tags=["ai"])
app.include_router(ingest.router, prefix="/api/v1/ingest", tags=["ingest"])


@app.get("/api/v1/health")
async def health_check():
    return {"status": "healthy", "service": "beauty-trends-monitor"}
