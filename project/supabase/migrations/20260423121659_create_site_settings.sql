/*
  # Create Site Settings Table

  1. New Tables
    - `site_settings` — Key-value store for site-wide configurable settings
      - `key` (text, PK) — Setting key (e.g., 'site_name', 'tagline', 'footer_text')
      - `value` (text) — Setting value
      - `updated_at` (timestamptz)

  2. Initial Data
    - Pre-populated with default values for site name, tagline, footer text,
      header announcement bar text, and footer links

  3. Security
    - RLS enabled
    - Public can read settings
    - Only authenticated users can update settings
*/

CREATE TABLE IF NOT EXISTS site_settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site settings"
  ON site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert site settings"
  ON site_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update site settings"
  ON site_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default settings
INSERT INTO site_settings (key, value) VALUES
  ('site_name', 'BiographyHub'),
  ('tagline', 'Life Stories'),
  ('announcement_text', 'Discover the lives of the world''s most influential people — Updated daily'),
  ('footer_about', 'BiographyHub is dedicated to publishing accurate, in-depth biographies of the world''s most influential people across politics, entertainment, science, and business.'),
  ('footer_copyright', 'BiographyHub. All rights reserved.'),
  ('header_show_announcement', 'true')
ON CONFLICT (key) DO NOTHING;
