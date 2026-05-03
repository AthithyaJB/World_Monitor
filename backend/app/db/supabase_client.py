from supabase import create_client, Client

_client: Client | None = None


def init_supabase(url: str, key: str) -> None:
    global _client
    if url and key:
        _client = create_client(url, key)


def get_supabase() -> Client:
    if _client is None:
        raise RuntimeError("Supabase client not initialized. Check SUPABASE_URL and SUPABASE_SERVICE_KEY.")
    return _client
