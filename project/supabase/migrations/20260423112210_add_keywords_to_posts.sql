/*
  # Add SEO Keywords to Posts

  1. Modified Tables
    - `posts` — Added `keywords` column (text) for SEO keyword storage
      - Comma-separated keywords for meta keywords tag and keyword density analysis
      - Default empty string

  2. Security
    - No RLS changes needed; column inherits existing post policies
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'keywords'
  ) THEN
    ALTER TABLE posts ADD COLUMN keywords text DEFAULT '';
  END IF;
END $$;
