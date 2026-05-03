-- Beauty Trends World Monitor — Supabase Schema
-- Run this in Supabase SQL Editor to create all tables

-- 1. Trends: Core trend observations
CREATE TABLE trends (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    keyword         TEXT NOT NULL,
    category        TEXT NOT NULL,
    subcategory     TEXT,
    region          TEXT NOT NULL DEFAULT 'global',
    source          TEXT NOT NULL,
    score           FLOAT NOT NULL DEFAULT 0,
    volume          INTEGER DEFAULT 0,
    sentiment       FLOAT,
    metadata        JSONB DEFAULT '{}',
    collected_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trends_keyword ON trends (keyword);
CREATE INDEX idx_trends_region ON trends (region);
CREATE INDEX idx_trends_source ON trends (source);
CREATE INDEX idx_trends_collected_at ON trends (collected_at DESC);
CREATE INDEX idx_trends_category ON trends (category);

-- 2. Social Posts: Individual posts for real-time feed
CREATE TABLE social_posts (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source          TEXT NOT NULL,
    source_id       TEXT,
    author          TEXT,
    content         TEXT NOT NULL,
    url             TEXT,
    hashtags        TEXT[] DEFAULT '{}',
    keywords        TEXT[] DEFAULT '{}',
    sentiment       FLOAT,
    engagement      INTEGER DEFAULT 0,
    region          TEXT DEFAULT 'unknown',
    posted_at       TIMESTAMPTZ,
    collected_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(source, source_id)
);

CREATE INDEX idx_social_posts_collected ON social_posts (collected_at DESC);
CREATE INDEX idx_social_posts_keywords ON social_posts USING GIN (keywords);

-- 3. Products: Beauty product rankings
CREATE TABLE products (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name            TEXT NOT NULL,
    brand           TEXT,
    category        TEXT NOT NULL,
    ingredients     TEXT[] DEFAULT '{}',
    image_url       TEXT,
    source          TEXT NOT NULL,
    source_url      TEXT,
    price           DECIMAL(10,2),
    currency        TEXT DEFAULT 'USD',
    rating          FLOAT,
    review_count    INTEGER DEFAULT 0,
    trend_score     FLOAT DEFAULT 0,
    rank            INTEGER,
    rank_change     INTEGER DEFAULT 0,
    region          TEXT DEFAULT 'US',
    collected_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(source, name, brand, region)
);

CREATE INDEX idx_products_category ON products (category);
CREATE INDEX idx_products_trend ON products (trend_score DESC);

-- 4. AI Insights: Cached AI reports & anomalies
CREATE TABLE ai_insights (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type            TEXT NOT NULL,
    query           TEXT,
    title           TEXT NOT NULL,
    content         TEXT NOT NULL,
    keywords        TEXT[] DEFAULT '{}',
    region          TEXT DEFAULT 'global',
    confidence      FLOAT,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ
);

CREATE INDEX idx_insights_type ON ai_insights (type);
CREATE INDEX idx_insights_created ON ai_insights (created_at DESC);

-- 5. Trend Snapshots: Aggregated time-series rollups
CREATE TABLE trend_snapshots (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    keyword         TEXT NOT NULL,
    category        TEXT NOT NULL,
    region          TEXT NOT NULL DEFAULT 'global',
    period          TEXT NOT NULL,
    period_start    TIMESTAMPTZ NOT NULL,
    avg_score       FLOAT NOT NULL,
    total_volume    INTEGER NOT NULL DEFAULT 0,
    avg_sentiment   FLOAT,
    source_breakdown JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(keyword, region, period, period_start)
);

CREATE INDEX idx_snapshots_lookup ON trend_snapshots (keyword, region, period, period_start DESC);

-- Enable Realtime on key tables (run in Supabase dashboard or via API)
-- ALTER PUBLICATION supabase_realtime ADD TABLE trends;
-- ALTER PUBLICATION supabase_realtime ADD TABLE social_posts;
-- ALTER PUBLICATION supabase_realtime ADD TABLE ai_insights;
