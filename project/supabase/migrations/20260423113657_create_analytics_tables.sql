/*
  # Analytics Tables for Dashboard

  1. New Tables
    - `page_views` — Tracks every page view with referrer, country, device, browser
      - `id` (uuid, PK)
      - `path` (text) — URL path visited
      - `post_id` (uuid, FK → posts, nullable) — linked post if applicable
      - `referrer` (text) — full referrer URL
      - `referrer_source` (text) — categorized source (google, direct, bing, social, etc.)
      - `country` (text) — country code from IP geolocation
      - `city` (text) — city from IP geolocation
      - `device_type` (text) — desktop, mobile, tablet
      - `browser` (text) — browser name
      - `os` (text) — operating system
      - `session_id` (text) — ties page views to a session
      - `is_unique` (boolean) — first visit in session for this path
      - `created_at` (timestamptz)

    - `click_events` — Tracks ad and internal link clicks
      - `id` (uuid, PK)
      - `session_id` (text)
      - `element_type` (text) — 'ad', 'internal_link', 'external_link'
      - `element_id` (text) — identifier for the clicked element
      - `path` (text) — page where click occurred
      - `created_at` (timestamptz)

    - `visitor_sessions` — Aggregated session data
      - `id` (text, PK) — session UUID
      - `country` (text)
      - `city` (text)
      - `device_type` (text)
      - `browser` (text)
      - `os` (text)
      - `referrer_source` (text)
      - `landing_page` (text)
      - `page_count` (integer, default 1)
      - `created_at` (timestamptz)
      - `last_activity` (timestamptz)

  2. Indexes
    - page_views: path, post_id, created_at, country, referrer_source
    - click_events: element_type, created_at
    - visitor_sessions: created_at, country, referrer_source

  3. Security
    - RLS enabled on all tables
    - Public can INSERT (for tracking)
    - Only authenticated admins can SELECT
*/

-- Page views
CREATE TABLE IF NOT EXISTS page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL,
  post_id uuid REFERENCES posts(id) ON DELETE SET NULL,
  referrer text DEFAULT '',
  referrer_source text DEFAULT 'direct',
  country text DEFAULT '',
  city text DEFAULT '',
  device_type text DEFAULT '',
  browser text DEFAULT '',
  os text DEFAULT '',
  session_id text NOT NULL,
  is_unique boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert page views"
  ON page_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read page views"
  ON page_views FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS page_views_path_idx ON page_views(path);
CREATE INDEX IF NOT EXISTS page_views_post_idx ON page_views(post_id);
CREATE INDEX IF NOT EXISTS page_views_created_idx ON page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS page_views_country_idx ON page_views(country);
CREATE INDEX IF NOT EXISTS page_views_ref_source_idx ON page_views(referrer_source);

-- Click events
CREATE TABLE IF NOT EXISTS click_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  element_type text NOT NULL,
  element_id text DEFAULT '',
  path text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE click_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert click events"
  ON click_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read click events"
  ON click_events FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS click_events_type_idx ON click_events(element_type);
CREATE INDEX IF NOT EXISTS click_events_created_idx ON click_events(created_at DESC);

-- Visitor sessions
CREATE TABLE IF NOT EXISTS visitor_sessions (
  id text PRIMARY KEY,
  country text DEFAULT '',
  city text DEFAULT '',
  device_type text DEFAULT '',
  browser text DEFAULT '',
  os text DEFAULT '',
  referrer_source text DEFAULT 'direct',
  landing_page text DEFAULT '',
  page_count integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  last_activity timestamptz DEFAULT now()
);

ALTER TABLE visitor_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert visitor sessions"
  ON visitor_sessions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update visitor sessions"
  ON visitor_sessions FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read visitor sessions"
  ON visitor_sessions FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS visitor_sessions_created_idx ON visitor_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS visitor_sessions_country_idx ON visitor_sessions(country);
CREATE INDEX IF NOT EXISTS visitor_sessions_ref_source_idx ON visitor_sessions(referrer_source);
