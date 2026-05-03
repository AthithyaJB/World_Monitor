# Beauty Trends World Monitor

## Complete Project Plan, Architecture & Workflow

> **Generated**: April 2026
> **Status**: Phase 1-3 Complete (Frontend + Backend built, demo data live)
> **Total Files**: 79 source files | **Total Size**: 734 MB (incl. dependencies)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Tech Stack & Services](#3-tech-stack--services)
4. [Project Structure](#4-project-structure)
5. [Database Schema](#5-database-schema)
6. [API Endpoints](#6-api-endpoints)
7. [Data Ingestion Pipeline](#7-data-ingestion-pipeline)
8. [Real-time Data Flow](#8-real-time-data-flow)
9. [Dashboard Pages](#9-dashboard-pages)
10. [Frontend Components](#10-frontend-components)
11. [Implementation Phases](#11-implementation-phases)
12. [Cloud Services Setup Guide](#12-cloud-services-setup-guide)
13. [Environment Variables](#13-environment-variables)
14. [Running the Project](#14-running-the-project)
15. [Installed Packages & Sizes](#15-installed-packages--sizes)
16. [File Manifest](#16-file-manifest)
17. [Key Technical Decisions](#17-key-technical-decisions)
18. [Verification Checklist](#18-verification-checklist)

---

## 1. Project Overview

A **Palantir-level real-time dashboard** that monitors global beauty trends across social media, search engines, e-commerce platforms, and news outlets. Designed for a **resource-constrained Mac** — all heavy compute, storage, and processing runs on cloud APIs and managed services. The local machine only runs lightweight dev/production servers.

### Key Capabilities

- **Global Trend Map** — Interactive world choropleth showing beauty trend intensity by country
- **Real-time Social Feed** — Live stream of trending beauty posts from Reddit, X/Twitter, TikTok, News
- **Trend Analytics** — Time-series charts, sentiment analysis, category breakdowns
- **Product Rankings** — Trending beauty products with ratings, prices, and change indicators
- **AI Command Center** — Natural language querying powered by Claude API, auto-generated reports, anomaly detection

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLOUD SERVICES                          │
│                                                                 │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────┐    │
│  │  Upstash     │    │   Supabase   │    │   Claude API    │    │
│  │  QStash      │───▶│  PostgreSQL  │◀───│   (Anthropic)   │    │
│  │  (cron jobs) │    │  + Realtime  │    │  Sentiment/NLP  │    │
│  └──────┬───────┘    └──────┬───────┘    └────────┬────────┘    │
│         │                   │                     │             │
│         ▼                   ▼                     │             │
│  ┌──────────────┐    ┌──────────────┐             │             │
│  │  Python      │───▶│  Upstash     │             │             │
│  │  FastAPI     │    │  Redis       │             │             │
│  │  (Railway)   │◀───│  (cache)     │             │             │
│  └──────────────┘    └──────────────┘             │             │
│         ▲                   │                     │             │
│         │                   ▼                     │             │
│         │            ┌──────────────┐             │             │
│         └────────────│  Next.js 14  │─────────────┘             │
│                      │  (Vercel)    │                           │
│                      └──────────────┘                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     DATA SOURCES (APIs)                         │
│                                                                 │
│  Reddit API │ X/Twitter API │ TikTok (RapidAPI) │ Google Trends │
│  Amazon (RapidAPI) │ NewsAPI │ Google News RSS                  │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow Summary

```
Data Sources → Collectors → Normalizer → Supabase (PostgreSQL)
                                              │
                                              ├── Realtime WebSocket → Frontend (live updates)
                                              ├── Claude API → Sentiment Analysis → UPDATE posts
                                              ├── Aggregator → Trend Snapshots (time-series)
                                              └── Claude API → Anomaly Detection → AI Insights
```

---

## 3. Tech Stack & Services

### Application Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 (App Router) | Dashboard UI, SSR/SSG |
| **Styling** | Tailwind CSS 4 | Dark-themed Palantir aesthetic |
| **Charts** | Recharts | Time-series, pie, sparkline charts |
| **Map** | D3-geo + TopoJSON | Interactive world choropleth |
| **Icons** | Lucide React | Consistent icon system |
| **State** | SWR | Data fetching with caching & revalidation |
| **Backend** | Python FastAPI | REST API, data ingestion, AI orchestration |
| **Validation** | Pydantic | Request/response schemas |

### Cloud Services (All Free Tier)

| Service | Purpose | URL |
|---------|---------|-----|
| **Supabase** | PostgreSQL database + Realtime WebSockets + Auth | https://supabase.com |
| **Upstash Redis** | API response caching, rate limiting | https://upstash.com |
| **Upstash QStash** | Scheduled cron jobs for data ingestion | https://upstash.com |
| **Anthropic Claude** | Sentiment analysis, trend reports, NL querying | https://console.anthropic.com |
| **Vercel** | Frontend deployment | https://vercel.com |
| **Railway** | Backend deployment | https://railway.app |

### Data Source APIs

| Source | API | Auth | Rate Limit |
|--------|-----|------|-----------|
| Reddit | Reddit API v1 | OAuth2 (client credentials) | 60 req/min |
| X/Twitter | Twitter API v2 | Bearer token | 500K tweets/month (free) |
| TikTok | RapidAPI TikTok Scraper | API key | Varies by plan |
| Google Trends | pytrends (unofficial) | None | ~10 req/min |
| Amazon | RapidAPI Real-Time Amazon | API key | Varies by plan |
| News | NewsAPI.org | API key | 100 req/day (free) |
| Google News | RSS feed | None | Unlimited |

---

## 4. Project Structure

```
World_Monitor/
├── frontend/                              # Next.js 14 App Router
│   ├── public/
│   │   └── geo/
│   │       └── world-110m.json            # TopoJSON world map (105 KB)
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx                 # Root layout (fonts, dark theme)
│   │   │   ├── page.tsx                   # Redirects to /dashboard
│   │   │   ├── globals.css                # Tailwind config + custom tokens
│   │   │   ├── dashboard/
│   │   │   │   ├── layout.tsx             # Dashboard shell (sidebar + topbar)
│   │   │   │   ├── page.tsx               # Overview — Global Trend Map
│   │   │   │   ├── feed/page.tsx          # Real-time Social Feed
│   │   │   │   ├── analytics/page.tsx     # Time-series & Sentiment charts
│   │   │   │   ├── products/page.tsx      # Product Rankings table
│   │   │   │   └── command/page.tsx       # AI Command Center
│   │   │   └── api/
│   │   │       └── chat/route.ts          # BFF proxy for Claude streaming
│   │   ├── components/
│   │   │   ├── charts/
│   │   │   │   ├── TrendLineChart.tsx     # Multi-line time-series (Recharts)
│   │   │   │   ├── SentimentGauge.tsx     # Circular sentiment indicator
│   │   │   │   ├── CategoryBreakdown.tsx  # Donut chart by category
│   │   │   │   └── SparklineCard.tsx      # Compact trend card with sparkline
│   │   │   ├── map/
│   │   │   │   └── GlobalTrendMap.tsx     # D3-geo world choropleth with tooltips
│   │   │   ├── feed/
│   │   │   │   ├── SocialFeed.tsx         # Feed container with source filters
│   │   │   │   └── FeedCard.tsx           # Individual social post card
│   │   │   ├── products/
│   │   │   │   └── ProductRankingTable.tsx # Sortable product ranking table
│   │   │   ├── command/
│   │   │   │   ├── ChatInterface.tsx      # AI chat with suggested queries
│   │   │   │   ├── AnomalyAlert.tsx       # Anomaly notification cards
│   │   │   │   └── TrendReport.tsx        # Expandable AI report accordion
│   │   │   └── layout/
│   │   │       ├── Sidebar.tsx            # Fixed navigation sidebar
│   │   │       ├── Topbar.tsx             # Search, category filters, live indicator
│   │   │       └── MetricCard.tsx         # KPI metric card with trend arrow
│   │   ├── hooks/
│   │   │   ├── useRealtimeTrends.ts       # Supabase subscription for trends table
│   │   │   ├── useRealtimeFeed.ts         # Supabase subscription for social_posts
│   │   │   └── useTrendQuery.ts           # SWR wrapper with 3s timeout
│   │   ├── lib/
│   │   │   ├── api.ts                     # Typed fetch wrappers with 5s timeout
│   │   │   ├── constants.ts               # Categories, colors, formatters
│   │   │   └── supabase/
│   │   │       └── client.ts              # Lazy-initialized Supabase client
│   │   └── types/
│   │       ├── trend.ts                   # Trend, TrendMapPoint, TopTrend
│   │       ├── social-post.ts             # SocialPost interface
│   │       ├── product.ts                 # Product interface
│   │       └── ai-insight.ts              # AIInsight interface
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── .env.local                         # Frontend env vars (git-ignored)
│
├── backend/                               # Python FastAPI
│   ├── app/
│   │   ├── main.py                        # App factory, CORS, lifespan events
│   │   ├── config.py                      # Pydantic Settings (all env vars)
│   │   ├── routers/
│   │   │   ├── trends.py                  # GET /trends, /trends/map, /trends/top
│   │   │   ├── products.py                # GET /products/rankings, /products/{id}
│   │   │   ├── feed.py                    # GET /feed/recent
│   │   │   ├── analytics.py               # GET /analytics/timeseries, /sentiment, /categories
│   │   │   ├── ai.py                      # POST /ai/query, /ai/report | GET /ai/anomalies
│   │   │   └── ingest.py                  # POST /ingest/trigger (QStash webhook)
│   │   ├── services/
│   │   │   ├── trend_service.py           # Trend aggregation, map data, top trends
│   │   │   ├── ai_service.py              # Claude API: queries, reports, anomaly detection
│   │   │   └── cache_service.py           # Upstash Redis: get/set/invalidate
│   │   ├── ingestion/
│   │   │   ├── orchestrator.py            # Runs collectors, normalizes, stores, analyzes
│   │   │   ├── normalizer.py              # Unified schema mapping + region normalization
│   │   │   ├── sentiment.py               # Claude-based batch sentiment analysis
│   │   │   └── collectors/
│   │   │       ├── base.py                # Abstract BaseCollector + keyword/category lists
│   │   │       ├── reddit.py              # Reddit API (OAuth2 client credentials)
│   │   │       ├── twitter.py             # X/Twitter API v2 (recent search)
│   │   │       ├── tiktok.py              # TikTok via RapidAPI
│   │   │       ├── google_trends.py       # pytrends (interest over time + by region)
│   │   │       ├── ecommerce.py           # Amazon via RapidAPI
│   │   │       └── news.py               # NewsAPI + Google News RSS
│   │   ├── models/
│   │   │   └── schemas.py                 # Pydantic request/response models
│   │   └── db/
│   │       └── supabase_client.py         # Supabase client singleton
│   ├── requirements.txt
│   ├── Procfile                           # Railway deployment command
│   └── .env                               # Backend env vars (git-ignored)
│
├── .gitignore                             # Blocks all .env files, allows .env.example
├── .env.example                           # Template with placeholder values (safe to commit)
├── supabase_schema.sql                    # SQL to create all 5 tables + indexes
├── project_log.txt                        # Build log with file sizes and package list
└── PROJECT_PLAN_AND_WORKFLOW.md           # This file
```

---

## 5. Database Schema

**5 tables** in Supabase PostgreSQL. Realtime enabled on `trends`, `social_posts`, `ai_insights`.

### Table: `trends`
Core trend observations. Each row = one keyword observation from one source at one point in time.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| keyword | TEXT | e.g. "retinol", "glass skin" |
| category | TEXT | skincare, makeup, haircare, fragrance, nails, wellness |
| subcategory | TEXT | Optional sub-classification |
| region | TEXT | ISO 3166-1 alpha-2 code or "global" |
| source | TEXT | reddit, twitter, tiktok, google_trends, ecommerce, news |
| score | FLOAT | Normalized 0-100 intensity |
| volume | INTEGER | Raw mention/search count |
| sentiment | FLOAT | -1.0 (negative) to 1.0 (positive) |
| metadata | JSONB | Source-specific extras |
| collected_at | TIMESTAMPTZ | When data was collected |

**Indexes**: keyword, region, source, collected_at (DESC), category

### Table: `social_posts`
Individual social media posts for the real-time feed.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| source | TEXT | reddit, twitter, tiktok, news |
| source_id | TEXT | Original post ID (for dedup) |
| author | TEXT | Username or author name |
| content | TEXT | Post text (max 1000 chars) |
| url | TEXT | Link to original post |
| hashtags | TEXT[] | Extracted hashtags |
| keywords | TEXT[] | Matched beauty keywords |
| sentiment | FLOAT | -1.0 to 1.0 (set by Claude) |
| engagement | INTEGER | likes + comments + shares |
| region | TEXT | ISO code or "unknown" |
| posted_at | TIMESTAMPTZ | Original post timestamp |

**Unique constraint**: (source, source_id)

### Table: `products`
Beauty product rankings from e-commerce platforms.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| name | TEXT | Product name |
| brand | TEXT | Brand name |
| category | TEXT | Product category |
| ingredients | TEXT[] | Key ingredients list |
| image_url | TEXT | Product image |
| price | DECIMAL(10,2) | Current price |
| trend_score | FLOAT | Calculated trending intensity (0-100) |
| rank | INTEGER | Position in category |
| rank_change | INTEGER | +/- since last period |

**Unique constraint**: (source, name, brand, region)

### Table: `ai_insights`
Cached AI-generated reports, anomaly detections, and query responses.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| type | TEXT | report, anomaly, prediction, query_response |
| query | TEXT | User's NL query (if applicable) |
| title | TEXT | Insight title |
| content | TEXT | Markdown-formatted insight body |
| confidence | FLOAT | 0-1 for predictions/anomalies |
| expires_at | TIMESTAMPTZ | Cache TTL |

### Table: `trend_snapshots`
Pre-aggregated rollups for efficient time-series queries.

| Column | Type | Description |
|--------|------|-------------|
| keyword | TEXT | Trend keyword |
| category | TEXT | Category |
| region | TEXT | Region code |
| period | TEXT | "hourly", "daily", "weekly" |
| period_start | TIMESTAMPTZ | Start of period |
| avg_score | FLOAT | Average score in period |
| total_volume | INTEGER | Sum of volumes |
| avg_sentiment | FLOAT | Average sentiment |
| source_breakdown | JSONB | {"reddit": 40, "twitter": 30, ...} |

**Unique constraint**: (keyword, region, period, period_start)

---

## 6. API Endpoints

Base URL: `http://localhost:8000/api/v1` (dev) or deployed Railway URL

### Trends

| Method | Endpoint | Params | Description |
|--------|----------|--------|-------------|
| GET | `/trends` | ?category, ?region, ?source, ?since_hours, ?limit, ?offset | List trends with filters |
| GET | `/trends/map` | — | Aggregated scores by region for choropleth |
| GET | `/trends/top` | ?limit | Top N trending keywords with change % |

### Products

| Method | Endpoint | Params | Description |
|--------|----------|--------|-------------|
| GET | `/products/rankings` | ?category, ?region, ?sort_by, ?limit, ?offset | Ranked products |
| GET | `/products/{id}` | — | Single product detail |

### Feed

| Method | Endpoint | Params | Description |
|--------|----------|--------|-------------|
| GET | `/feed/recent` | ?source, ?limit, ?offset | Paginated recent social posts |

### Analytics

| Method | Endpoint | Params | Description |
|--------|----------|--------|-------------|
| GET | `/analytics/timeseries` | ?keyword (required), ?region, ?period, ?days | Time-series for keyword |
| GET | `/analytics/sentiment` | ?keyword, ?category, ?days | Sentiment over time |
| GET | `/analytics/categories` | — | Category distribution breakdown |

### AI

| Method | Endpoint | Body/Params | Description |
|--------|----------|-------------|-------------|
| POST | `/ai/query` | `{query, region?, category?}` | NL question → Claude → answer |
| POST | `/ai/report` | ?keyword, ?region | Generate trend report |
| GET | `/ai/anomalies` | ?limit | Recent anomaly alerts |

### Ingestion

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/ingest/trigger` | `{job_type}` | Trigger data collection (QStash webhook) |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |

---

## 7. Data Ingestion Pipeline

### Architecture

```
Upstash QStash (cron schedule)
       │
       ▼ POST /ingest/trigger (with signature verification)
       │
  Orchestrator (orchestrator.py)
       │
       ├─► RedditCollector.collect()     ─┐
       ├─► TwitterCollector.collect()     │
       ├─► TikTokCollector.collect()      ├─► normalizer.py ─► Supabase INSERT
       ├─► GoogleTrendsCollector.collect() │   (trends + social_posts)
       ├─► EcommerceCollector.collect()   ─┤─► Supabase INSERT (products)
       └─► NewsCollector.collect()        ─┘
       │
       ▼ Post-collection pipeline:
       │
       ├─► Sentiment Analysis (sentiment.py)
       │   └── Claude API batch: 20 posts/call → UPDATE social_posts.sentiment
       │
       ├─► Snapshot Aggregation (orchestrator.py)
       │   └── Aggregate hourly/daily → UPSERT trend_snapshots
       │
       ├─► Anomaly Detection (ai_service.py)
       │   └── Claude API: current vs historical → INSERT ai_insights
       │
       └─► Cache Invalidation
           └── Invalidate Upstash Redis keys (trends:*, feed:*, etc.)
```

### Collector Pattern

Each collector extends `BaseCollector`:

```python
class BaseCollector(ABC):
    source_name: str
    BEAUTY_KEYWORDS: list[str]      # 40+ curated keywords
    CATEGORY_MAP: dict[str, str]    # keyword → category mapping

    @abstractmethod
    async def collect(self, keywords=None) -> list[RawDataPoint]: ...
```

### Scheduling Strategy

| Schedule | Collectors | Reason |
|----------|-----------|--------|
| Every 30 min | Reddit, Twitter, News | High-volume, cheap API calls |
| Every 2 hours | TikTok, E-commerce | Rate-limited APIs |
| Every 6 hours | Google Trends | pytrends rate limits |
| Daily 00:00 UTC | Full snapshot + AI report | Comprehensive daily rollup |

### Job Types

| job_type | Collectors Run |
|----------|---------------|
| `standard` | Reddit, Twitter, News |
| `google_trends` | Google Trends |
| `ecommerce` | E-commerce, TikTok |
| `full` | All 6 collectors |
| `daily_report` | Triggers AI report generation |

---

## 8. Real-time Data Flow

```
1. QStash cron fires (every 30 min)
       │
2. POST → Backend /ingest/trigger
       │
3. Orchestrator runs collectors concurrently (asyncio.gather)
       │
4. Normalized data → Supabase INSERT
       │
       ├──► Supabase Realtime detects INSERT on `trends` table
       │         │
       │         ▼ WebSocket push to browser
       │         │
       │         ▼ useRealtimeTrends hook → React state update
       │         │
       │         ▼ GlobalTrendMap re-renders (new color intensity)
       │
       └──► Supabase Realtime detects INSERT on `social_posts` table
                 │
                 ▼ WebSocket push to browser
                 │
                 ▼ useRealtimeFeed hook → prepend to feed
                 │
                 ▼ New FeedCard appears at top with animation

5. Sentiment batch (Claude API) → UPDATE posts
       │
       └──► Supabase Realtime → FeedCard sentiment pill appears

6. Anomaly detection (Claude API) → INSERT ai_insights
       │
       └──► AnomalyAlert banner appears on dashboard
```

**Latency**: Data source → visible on dashboard: **~10-30 seconds**

---

## 9. Dashboard Pages

### Page 1: Overview (`/dashboard`)

```
┌─────────────────────────────────────────────────────────────┐
│ [Anomaly Banner - if any detected]                          │
├──────────┬──────────┬──────────┬──────────┐                 │
│ Active   │ Top      │ Avg      │ Total    │                 │
│ Trends   │ Category │ Sentiment│ Mentions │                 │
│ 42 ↑12%  │ Skincare │ 0.65 ↑5% │ 156K ↑18%│                │
├──────────┴──────────┴──────────┴──────────┤─────────────────┤
│                                           │ Top Trending    │
│     Interactive World Choropleth Map      │ ┌─────────────┐ │
│     (colored by trend intensity)          │ │peptide ▂▃▅▇  │ │
│     Click country to filter               │ │glass sk▃▅▆▇  │ │
│     Hover for tooltip with top keywords   │ │lip oil ▁▃▅▇  │ │
│                                           │ │snail m ▃▄▅▆  │ │
│                                           │ │retinol ▅▅▅▅  │ │
│                                           │ └─────────────┘ │
└───────────────────────────────────────────┴─────────────────┘
```

### Page 2: Live Feed (`/dashboard/feed`)

- Source filter pills (All, Reddit, X, TikTok, News)
- Infinite scroll of FeedCards
- Each card: source icon, author, content, sentiment pill, keywords, engagement count
- Real-time prepend via Supabase subscription

### Page 3: Analytics (`/dashboard/analytics`)

- Keyword selector dropdown
- Time-series line chart (trend score over 7 days)
- Sentiment gauge (circular) + positive/neutral/negative breakdown
- Category distribution donut chart
- Sentiment over time line chart (14 days)

### Page 4: Products (`/dashboard/products`)

- Category tabs (All, Skincare, Makeup, Haircare, etc.)
- Sortable ranking table: Rank, Product, Category, Price, Rating, Trend Score, Change
- Product images, brand names, star ratings, review counts

### Page 5: AI Command Center (`/dashboard/command`)

- Chat interface with streaming responses
- 6 suggested query chips
- "Generate Report" button
- Sidebar: anomaly alerts timeline + expandable AI report accordion

---

## 10. Frontend Components

### Component Hierarchy

```
RootLayout (app/layout.tsx)
 └─ DashboardLayout (dashboard/layout.tsx)
     ├─ Sidebar — fixed left nav with 5 route links + live indicator
     ├─ Topbar — search bar, category filter pills, live dot, refresh
     └─ Page Content (varies by route)

Overview Page
 ├─ MetricCard x4 (Active Trends, Top Category, Avg Sentiment, Total Mentions)
 ├─ GlobalTrendMap (D3-geo choropleth with tooltips)
 └─ SparklineCard x10 (keyword, score, change, mini chart)

Feed Page
 └─ SocialFeed
     ├─ Source filter buttons
     └─ FeedCard x N (source icon, author, content, sentiment, keywords)

Analytics Page
 ├─ TrendLineChart (Recharts — trend score over time)
 ├─ SentimentGauge (circular SVG gauge)
 ├─ CategoryBreakdown (Recharts — donut chart)
 └─ TrendLineChart (sentiment over time)

Products Page
 ├─ Category tabs
 └─ ProductRankingTable (sortable columns, rank change arrows)

Command Page
 ├─ ChatInterface (input, streaming response, suggested queries)
 ├─ AnomalyAlert (anomaly cards with confidence scores)
 └─ TrendReport (expandable report accordion)
```

---

## 11. Implementation Phases

### Phase 1: Foundation — COMPLETED

- [x] Next.js 14 + Tailwind CSS initialized
- [x] FastAPI backend scaffolded with all routers
- [x] Supabase SQL schema created (`supabase_schema.sql`)
- [x] Dashboard layout (sidebar, topbar, navigation)
- [x] All environment config files created

### Phase 2: Data Ingestion — COMPLETED (code ready, needs API keys)

- [x] BaseCollector abstract class with 40+ beauty keywords
- [x] RedditCollector (OAuth2 client credentials)
- [x] GoogleTrendsCollector (pytrends — no auth needed)
- [x] TwitterCollector, TikTokCollector, EcommerceCollector, NewsCollector
- [x] Normalizer (unified schema mapping)
- [x] Orchestrator (concurrent collection + post-processing pipeline)
- [x] Sentiment analysis service (Claude API batch)
- [x] /ingest/trigger endpoint

### Phase 3: Core Dashboard — COMPLETED

- [x] Overview page with world map, metrics, top trends
- [x] Feed page with real-time subscription hooks
- [x] Analytics page with time-series, sentiment, categories
- [x] Products page with ranking table and category tabs
- [x] AI Command Center with chat interface
- [x] Demo data baked into all pages for immediate preview
- [x] SWR hooks with 3s timeout (fast fail when backend unavailable)

### Phase 4: Cloud Services — PENDING

- [ ] Create Supabase project and run schema SQL
- [ ] Create Upstash Redis instance
- [ ] Create Upstash QStash schedules
- [ ] Obtain and configure API keys
- [ ] Fill in .env files and test end-to-end

### Phase 5: AI Command Center — PENDING (code ready)

- [ ] Test Claude API integration with real data
- [ ] Verify streaming responses in ChatInterface
- [ ] Test daily auto-report generation
- [ ] Test anomaly detection with real trend data

### Phase 6: Polish + Deploy — PENDING

- [ ] Deploy frontend to Vercel
- [ ] Deploy backend to Railway
- [ ] Configure QStash cron schedules pointing to Railway URL
- [ ] Add loading skeletons and error boundaries
- [ ] Mobile responsiveness
- [ ] Rate limiting middleware

---

## 12. Cloud Services Setup Guide

### Step 1: Supabase (Database + Realtime)

1. Go to https://supabase.com → Sign up / Sign in
2. Click **"New Project"** → name: `beauty-monitor`, set database password
3. Wait for project to initialize (~2 min)
4. Go to **SQL Editor** → paste contents of `supabase_schema.sql` → click **Run**
5. Go to **Project Settings → API** and copy:
   - `Project URL` → `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `SUPABASE_ANON_KEY` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_KEY` (backend only)
6. Go to **Database → Replication** → enable realtime for: `trends`, `social_posts`, `ai_insights`

### Step 2: Upstash Redis (Cache)

1. Go to https://upstash.com → Sign up
2. Click **Create Database** → name: `beauty-cache`, pick closest region
3. Go to **REST API** tab and copy:
   - `UPSTASH_REDIS_REST_URL` → `UPSTASH_REDIS_URL`
   - `UPSTASH_REDIS_REST_TOKEN` → `UPSTASH_REDIS_TOKEN`

### Step 3: Upstash QStash (Cron Scheduling)

1. In Upstash dashboard → go to **QStash**
2. Copy: `QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY`
3. After backend is deployed, create cron schedules:
   - Every 30 min: `POST <backend-url>/api/v1/ingest/trigger` body: `{"job_type":"standard"}`
   - Every 2 hours: `POST <backend-url>/api/v1/ingest/trigger` body: `{"job_type":"ecommerce"}`
   - Every 6 hours: `POST <backend-url>/api/v1/ingest/trigger` body: `{"job_type":"google_trends"}`
   - Daily: `POST <backend-url>/api/v1/ingest/trigger` body: `{"job_type":"full"}`

### Step 4: API Keys

| Service | How to Get | Required? |
|---------|-----------|-----------|
| **Anthropic** | https://console.anthropic.com → API Keys → Create | Yes (for AI features) |
| **Reddit** | https://www.reddit.com/prefs/apps → Create app → type: "script" | Yes (primary data source) |
| **NewsAPI** | https://newsapi.org/register | Optional (Google News RSS works without) |
| **RapidAPI** | https://rapidapi.com → Subscribe to TikTok Scraper + Amazon Data | Optional |
| **Twitter/X** | https://developer.twitter.com → Create project + app | Optional |

---

## 13. Environment Variables

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here
```

### Backend (`backend/.env`)

```env
# Supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here

# Upstash Redis
UPSTASH_REDIS_URL=https://your-redis-id.upstash.io
UPSTASH_REDIS_TOKEN=your-redis-token-here

# Upstash QStash
QSTASH_TOKEN=your-qstash-token-here
QSTASH_CURRENT_SIGNING_KEY=your-current-signing-key
QSTASH_NEXT_SIGNING_KEY=your-next-signing-key

# Anthropic Claude API
ANTHROPIC_API_KEY=your-anthropic-api-key-here

# Reddit API
REDDIT_CLIENT_ID=your-reddit-client-id
REDDIT_CLIENT_SECRET=your-reddit-client-secret
REDDIT_USER_AGENT=BeautyTrendsMonitor/1.0

# Twitter/X API
TWITTER_BEARER_TOKEN=your-twitter-bearer-token

# RapidAPI (TikTok + Amazon)
RAPIDAPI_KEY=your-rapidapi-key

# NewsAPI
NEWSAPI_KEY=your-newsapi-key

# App
CORS_ORIGINS=["http://localhost:3000"]
ENVIRONMENT=development
```

---

## 14. Running the Project

### Frontend (Production Mode — recommended for limited RAM)

```bash
cd frontend
npx next build          # Compile once
npx next start --port 3000   # Serve pre-built pages
```

> **Note**: Do NOT use `npx next dev` on this machine — Turbopack compiles heavy libraries (Recharts, D3, Supabase) on-the-fly and causes multi-minute load times. Production build loads in ~26ms.

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Manual Data Ingestion (test)

```bash
# Full ingestion (all collectors)
curl -X POST http://localhost:8000/api/v1/ingest/trigger \
  -H "Content-Type: application/json" \
  -d '{"job_type":"full"}'

# Just Reddit + Twitter + News
curl -X POST http://localhost:8000/api/v1/ingest/trigger \
  -H "Content-Type: application/json" \
  -d '{"job_type":"standard"}'
```

### URLs

| Service | URL |
|---------|-----|
| Dashboard | http://localhost:3000/dashboard |
| API Health | http://localhost:8000/api/v1/health |
| API Docs (Swagger) | http://localhost:8000/docs |

---

## 15. Installed Packages & Sizes

### NPM Packages (Frontend)

| Package | Version | Purpose |
|---------|---------|---------|
| next | 16.2.2 | React framework (App Router) |
| react / react-dom | 19.2.4 | UI library |
| tailwindcss | 4.2.2 | Utility-first CSS |
| recharts | 3.8.1 | Charts (line, pie, sparkline) |
| d3-geo | 3.1.1 | Geographic projections for world map |
| d3-scale-chromatic | 3.1.0 | Color scales for choropleth |
| topojson-client | 3.1.0 | TopoJSON parsing |
| @supabase/supabase-js | 2.101.1 | Supabase client (DB + Realtime) |
| @supabase/ssr | 0.10.0 | SSR-compatible Supabase helpers |
| @anthropic-ai/sdk | 0.82.0 | Claude API client |
| swr | 2.4.1 | Data fetching with caching |
| lucide-react | 1.7.0 | Icon library |
| clsx | 2.1.1 | Conditional class names |
| tailwind-merge | 3.5.0 | Merge Tailwind classes |
| typescript | 5.9.3 | Type checking |

**Top node_modules by size:**

| Package | Size |
|---------|------|
| next | 169 MB |
| @next | 126 MB |
| lucide-react | 38 MB |
| typescript | 23 MB |
| recharts | 8.5 MB |
| @supabase | 8.0 MB |
| @anthropic-ai | 5.1 MB |
| **Total node_modules** | **552 MB** |

### Python Packages (Backend)

| Package | Version | Purpose |
|---------|---------|---------|
| fastapi | 0.115.0 | Web framework |
| uvicorn | 0.30.6 | ASGI server |
| pydantic-settings | 2.5.2 | Environment config |
| httpx | 0.27.2 | Async HTTP client |
| supabase | 2.9.1 | Supabase Python client |
| upstash-redis | 1.1.0 | Upstash Redis client |
| anthropic | 0.39.0 | Claude API client |
| pytrends | 4.9.2 | Google Trends (unofficial) |
| feedparser | 6.0.11 | RSS feed parsing |
| python-dotenv | 1.0.1 | .env file loading |

### Directory Sizes

| Directory | Size |
|-----------|------|
| frontend/src/ (source code) | 192 KB |
| frontend/public/ (static assets) | 128 KB |
| frontend/node_modules/ | 552 MB |
| frontend/.next/ (build output) | 181 MB |
| backend/ (all Python code) | 140 KB |
| **Total project** | **734 MB** |

---

## 16. File Manifest

### Backend (32 files)

```
backend/app/__init__.py
backend/app/config.py
backend/app/db/__init__.py
backend/app/db/supabase_client.py
backend/app/ingestion/__init__.py
backend/app/ingestion/collectors/__init__.py
backend/app/ingestion/collectors/base.py            (3.0 KB)
backend/app/ingestion/collectors/ecommerce.py       (2.9 KB)
backend/app/ingestion/collectors/google_trends.py   (3.3 KB)
backend/app/ingestion/collectors/news.py            (5.6 KB)
backend/app/ingestion/collectors/reddit.py          (3.5 KB)
backend/app/ingestion/collectors/tiktok.py          (2.8 KB)
backend/app/ingestion/collectors/twitter.py         (2.6 KB)
backend/app/ingestion/normalizer.py                 (2.9 KB)
backend/app/ingestion/orchestrator.py               (4.8 KB)
backend/app/ingestion/sentiment.py                  (2.3 KB)
backend/app/main.py                                 (1.5 KB)
backend/app/models/__init__.py
backend/app/models/schemas.py                       (2.0 KB)
backend/app/routers/__init__.py
backend/app/routers/ai.py                           (736 B)
backend/app/routers/analytics.py                    (3.0 KB)
backend/app/routers/feed.py                         (869 B)
backend/app/routers/ingest.py                       (434 B)
backend/app/routers/products.py                     (1.5 KB)
backend/app/routers/trends.py                       (767 B)
backend/app/services/__init__.py
backend/app/services/ai_service.py                  (6.3 KB)
backend/app/services/cache_service.py               (864 B)
backend/app/services/trend_service.py               (5.0 KB)
backend/Procfile                                    (54 B)
backend/requirements.txt                            (193 B)
```

### Frontend (35 files)

```
frontend/src/app/layout.tsx                          (776 B)
frontend/src/app/page.tsx                            (106 B)
frontend/src/app/globals.css                         (1.3 KB)
frontend/src/app/api/chat/route.ts                   (769 B)
frontend/src/app/dashboard/layout.tsx                (463 B)
frontend/src/app/dashboard/page.tsx                  (6.6 KB)
frontend/src/app/dashboard/feed/page.tsx             (4.6 KB)
frontend/src/app/dashboard/analytics/page.tsx        (4.9 KB)
frontend/src/app/dashboard/products/page.tsx         (5.4 KB)
frontend/src/app/dashboard/command/page.tsx          (3.7 KB)
frontend/src/components/charts/TrendLineChart.tsx    (1.9 KB)
frontend/src/components/charts/SentimentGauge.tsx    (1.8 KB)
frontend/src/components/charts/CategoryBreakdown.tsx (1.8 KB)
frontend/src/components/charts/SparklineCard.tsx     (1.6 KB)
frontend/src/components/map/GlobalTrendMap.tsx       (7.5 KB)
frontend/src/components/feed/SocialFeed.tsx          (2.3 KB)
frontend/src/components/feed/FeedCard.tsx            (2.9 KB)
frontend/src/components/products/ProductRankingTable.tsx (5.9 KB)
frontend/src/components/command/ChatInterface.tsx    (5.2 KB)
frontend/src/components/command/AnomalyAlert.tsx     (2.1 KB)
frontend/src/components/command/TrendReport.tsx      (2.2 KB)
frontend/src/components/layout/Sidebar.tsx           (2.4 KB)
frontend/src/components/layout/Topbar.tsx            (2.7 KB)
frontend/src/components/layout/MetricCard.tsx        (1.7 KB)
frontend/src/hooks/useRealtimeTrends.ts              (1.7 KB)
frontend/src/hooks/useRealtimeFeed.ts                (1.1 KB)
frontend/src/hooks/useTrendQuery.ts                  (951 B)
frontend/src/lib/api.ts                              (2.5 KB)
frontend/src/lib/constants.ts                        (2.1 KB)
frontend/src/lib/supabase/client.ts                  (460 B)
frontend/src/types/trend.ts                          (722 B)
frontend/src/types/social-post.ts                    (292 B)
frontend/src/types/product.ts                        (347 B)
frontend/src/types/ai-insight.ts                     (248 B)
frontend/public/geo/world-110m.json                  (105 KB)
```

### Root Files

```
.gitignore                                           (258 B)
.env.example                                         (927 B)
supabase_schema.sql                                  (4.1 KB)
project_log.txt                                      (build log)
PROJECT_PLAN_AND_WORKFLOW.md                         (this file)
```

---

## 17. Key Technical Decisions

| Decision | Chosen | Alternative | Rationale |
|----------|--------|-------------|-----------|
| Database | Supabase (hosted PostgreSQL) | Local PostgreSQL, MongoDB | Zero local resource usage, built-in Realtime WebSockets, free tier |
| Real-time | Supabase Realtime | FastAPI WebSockets | Backend stays stateless, no persistent connections on Railway |
| Cron Jobs | Upstash QStash | Vercel Cron, crontab | Supports HTTP targets to any host, retry/DLQ, signature verification |
| Caching | Upstash Redis | In-memory cache | Persists across Railway deploys, enables atomic rate limiting |
| Sentiment NLP | Claude API | Local spaCy/NLTK | No local ML models (RAM constraint), higher quality analysis |
| World Map | D3-geo + TopoJSON | Mapbox GL, react-simple-maps | Zero API key, client-side only, 105KB, React 19 compatible |
| Charts | Recharts | Tremor, Chart.js, D3 | React 19 compatible, lightweight, good defaults |
| Data Fetching | SWR | React Query, fetch | Lightweight, built-in caching + revalidation, stale-while-revalidate |
| Dev Server | `next build` + `next start` | `next dev` (Turbopack) | Turbopack too slow on limited RAM; production build loads in ~26ms |

---

## 18. Verification Checklist

### Infrastructure

- [ ] Supabase project created
- [ ] All 5 tables created via `supabase_schema.sql`
- [ ] Realtime enabled on `trends`, `social_posts`, `ai_insights`
- [ ] Upstash Redis instance created and connected
- [ ] Upstash QStash configured with cron schedules
- [ ] All API keys obtained and placed in `.env` files

### Backend

- [ ] `uvicorn app.main:app` starts without errors
- [ ] `GET /api/v1/health` returns `{"status": "healthy"}`
- [ ] Swagger docs load at `/docs`
- [ ] Manual ingestion trigger returns `{"status": "accepted"}`
- [ ] Data appears in Supabase tables after ingestion

### Frontend

- [ ] `next build` completes without errors
- [ ] `next start` serves dashboard at `localhost:3000/dashboard`
- [ ] World map renders with colored countries
- [ ] All 5 navigation links work
- [ ] Social feed shows posts (demo or real)
- [ ] Charts render with data
- [ ] AI Command Center accepts queries

### End-to-End

- [ ] Trigger ingestion → data appears in Supabase → dashboard updates
- [ ] Real-time: new post INSERT → feed updates without refresh
- [ ] AI query returns Claude-powered response with real data context
- [ ] Product rankings show real e-commerce data
- [ ] Anomaly detection flags genuine trend spikes

---

*Built with Next.js 14, Python FastAPI, Supabase, Upstash, Claude API, Recharts, and D3-geo.*
