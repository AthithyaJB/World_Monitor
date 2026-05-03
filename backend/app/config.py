from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Supabase
    supabase_url: str = ""
    supabase_service_key: str = ""

    # Upstash Redis
    upstash_redis_url: str = ""
    upstash_redis_token: str = ""

    # QStash
    qstash_current_signing_key: str = ""
    qstash_next_signing_key: str = ""

    # Anthropic
    anthropic_api_key: str = ""

    # Reddit
    reddit_client_id: str = ""
    reddit_client_secret: str = ""
    reddit_user_agent: str = "BeautyTrendsMonitor/1.0"

    # Twitter/X
    twitter_bearer_token: str = ""

    # RapidAPI
    rapidapi_key: str = ""

    # NewsAPI
    newsapi_key: str = ""

    # App
    cors_origins: list[str] = ["http://localhost:3000", "https://*.vercel.app"]
    environment: str = "development"

    model_config = {"env_file": ".env", "extra": "ignore"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
