import json
from datetime import datetime, timedelta, timezone
from anthropic import Anthropic
from app.config import get_settings
from app.db.supabase_client import get_supabase


def _get_client() -> Anthropic:
    return Anthropic(api_key=get_settings().anthropic_api_key)


async def get_trend_context(region: str | None = None, category: str | None = None) -> str:
    db = get_supabase()
    since = datetime.now(timezone.utc) - timedelta(hours=24)

    query = db.table("trends").select("keyword, category, region, source, score, volume, sentiment").gte("collected_at", since.isoformat()).order("score", desc=True).limit(50)

    if region:
        query = query.eq("region", region)
    if category:
        query = query.eq("category", category)

    result = query.execute()
    if not result.data:
        return "No recent trend data available."

    lines = ["Recent beauty trend data (last 24h):"]
    for row in result.data:
        lines.append(
            f"- {row['keyword']} ({row['category']}) in {row['region']}: "
            f"score={row['score']}, volume={row['volume']}, "
            f"sentiment={row.get('sentiment', 'N/A')}, source={row['source']}"
        )
    return "\n".join(lines)


async def query_trends(query: str, region: str | None = None, category: str | None = None) -> dict:
    client = _get_client()
    context = await get_trend_context(region, category)

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        system="""You are a beauty industry trend analyst with access to real-time global data.
Provide insightful, data-backed analysis of beauty trends. Be specific about products,
ingredients, techniques, and regional differences. Format your response in markdown with
clear sections. If the data shows interesting patterns, highlight them.""",
        messages=[
            {
                "role": "user",
                "content": f"""Based on the following trend data, answer this question: {query}

{context}

Provide a detailed, insightful response with specific data points from the trends.""",
            }
        ],
    )

    content = message.content[0].text

    # Store the insight
    db = get_supabase()
    insight = {
        "type": "query_response",
        "query": query,
        "title": query[:100],
        "content": content,
        "keywords": [],
        "region": region or "global",
    }
    db.table("ai_insights").insert(insight).execute()

    return {"title": query, "content": content, "type": "query_response"}


async def generate_report(keyword: str | None = None, region: str | None = None) -> dict:
    client = _get_client()
    context = await get_trend_context(region)

    prompt = "Generate a comprehensive beauty trends report"
    if keyword:
        prompt += f" focused on '{keyword}'"
    if region:
        prompt += f" for the {region} region"
    prompt += "."

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2048,
        system="""You are a senior beauty industry analyst. Generate professional trend reports
with sections: Executive Summary, Key Trends, Rising Stars, Regional Highlights,
and Predictions. Use markdown formatting. Be data-driven and specific.""",
        messages=[
            {
                "role": "user",
                "content": f"""{prompt}

{context}

Create a detailed report with actionable insights.""",
            }
        ],
    )

    content = message.content[0].text

    db = get_supabase()
    insight = {
        "type": "report",
        "title": f"Beauty Trends Report - {keyword or 'Global'} - {region or 'Worldwide'}",
        "content": content,
        "keywords": [keyword] if keyword else [],
        "region": region or "global",
    }
    result = db.table("ai_insights").insert(insight).execute()

    return {
        "id": result.data[0]["id"] if result.data else None,
        "title": insight["title"],
        "content": content,
        "type": "report",
    }


async def detect_anomalies() -> list[dict]:
    client = _get_client()
    db = get_supabase()
    now = datetime.now(timezone.utc)

    current = db.table("trend_snapshots").select("*").eq("period", "hourly").gte("period_start", (now - timedelta(hours=6)).isoformat()).execute()

    historical = db.table("trend_snapshots").select("*").eq("period", "daily").gte("period_start", (now - timedelta(days=7)).isoformat()).execute()

    if not current.data:
        return []

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        system="""You are a trend anomaly detector. Analyze current vs historical beauty trend data
and identify significant anomalies (sudden spikes, drops, or unusual patterns).
Return a JSON array of anomalies with fields: keyword, region, type (spike/drop/unusual),
description, confidence (0-1). Only flag genuinely significant changes.""",
        messages=[
            {
                "role": "user",
                "content": f"""Current trends (last 6 hours):
{json.dumps(current.data[:30], default=str)}

Historical baseline (last 7 days):
{json.dumps(historical.data[:30], default=str)}

Identify any anomalies. Return valid JSON array only.""",
            }
        ],
    )

    try:
        text = message.content[0].text
        start = text.find("[")
        end = text.rfind("]") + 1
        if start >= 0 and end > start:
            anomalies = json.loads(text[start:end])
        else:
            anomalies = []
    except (json.JSONDecodeError, IndexError):
        anomalies = []

    # Store detected anomalies
    for anomaly in anomalies:
        insight = {
            "type": "anomaly",
            "title": f"{anomaly.get('type', 'Anomaly')}: {anomaly.get('keyword', 'Unknown')}",
            "content": anomaly.get("description", ""),
            "keywords": [anomaly.get("keyword", "")] if anomaly.get("keyword") else [],
            "region": anomaly.get("region", "global"),
            "confidence": anomaly.get("confidence", 0.5),
        }
        db.table("ai_insights").insert(insight).execute()

    return anomalies


async def get_recent_anomalies(limit: int = 10) -> list[dict]:
    db = get_supabase()
    result = db.table("ai_insights").select("*").eq("type", "anomaly").order("created_at", desc=True).limit(limit).execute()
    return result.data
