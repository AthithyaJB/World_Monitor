import json
from anthropic import Anthropic
from app.config import get_settings
from app.db.supabase_client import get_supabase


async def analyze_sentiment_batch(post_ids: list[str] | None = None) -> int:
    settings = get_settings()
    if not settings.anthropic_api_key:
        return 0

    db = get_supabase()
    client = Anthropic(api_key=settings.anthropic_api_key)

    # Get posts without sentiment
    query = db.table("social_posts").select("id, content, keywords").is_("sentiment", "null").order("collected_at", desc=True).limit(50)
    result = query.execute()

    if not result.data:
        return 0

    updated_count = 0

    # Process in batches of 20
    for i in range(0, len(result.data), 20):
        batch = result.data[i : i + 20]
        posts_text = []
        for idx, post in enumerate(batch):
            posts_text.append(f"{idx}. [{post['id']}] {post['content'][:200]}")

        prompt = f"""Analyze the sentiment of these beauty-related social media posts.
For each post, return a sentiment score from -1.0 (very negative) to 1.0 (very positive).
Also extract the top 3 beauty-related keywords from each post.

Posts:
{chr(10).join(posts_text)}

Return a JSON array with objects having fields: id, sentiment (float), keywords (array of strings).
Return ONLY the JSON array, no other text."""

        try:
            message = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1024,
                messages=[{"role": "user", "content": prompt}],
            )

            text = message.content[0].text
            start = text.find("[")
            end = text.rfind("]") + 1
            if start < 0 or end <= start:
                continue

            results = json.loads(text[start:end])

            for item in results:
                post_id = item.get("id")
                sentiment = item.get("sentiment")
                keywords = item.get("keywords", [])

                if post_id and sentiment is not None:
                    db.table("social_posts").update({
                        "sentiment": float(sentiment),
                        "keywords": keywords,
                    }).eq("id", post_id).execute()
                    updated_count += 1

        except Exception:
            continue

    return updated_count
