import json
from upstash_redis import Redis

_redis: Redis | None = None


def init_redis(url: str, token: str) -> None:
    global _redis
    if url and token:
        _redis = Redis(url=url, token=token)


def get_redis() -> Redis | None:
    return _redis


async def get_cached(key: str) -> dict | list | None:
    if _redis is None:
        return None
    data = _redis.get(key)
    if data is None:
        return None
    return json.loads(data) if isinstance(data, str) else data


async def set_cached(key: str, data: dict | list, ttl_seconds: int = 300) -> None:
    if _redis is None:
        return
    _redis.set(key, json.dumps(data, default=str), ex=ttl_seconds)


async def invalidate(pattern: str) -> None:
    if _redis is None:
        return
    keys = _redis.keys(pattern)
    if keys:
        for key in keys:
            _redis.delete(key)
