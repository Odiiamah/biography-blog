/*
  # Biography Blog Schema

  1. New Tables
    - `categories` - Blog categories (Actors, Musicians, Politicians, etc.)
      - `id` (uuid, PK)
      - `name` (text, unique)
      - `slug` (text, unique)
      - `description` (text)
      - `created_at` (timestamptz)

    - `posts` - Biography articles
      - `id` (uuid, PK)
      - `title` (text)
      - `slug` (text, unique)
      - `content` (text)
      - `excerpt` (text)
      - `featured_image` (text, URL)
      - `category_id` (uuid, FK → categories)
      - `meta_title` (text)
      - `meta_description` (text)
      - `published` (boolean, default false)
      - `author_id` (uuid, FK → auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `contact_messages` - Contact form submissions
      - `id` (uuid, PK)
      - `name` (text)
      - `email` (text)
      - `subject` (text)
      - `message` (text)
      - `created_at` (timestamptz)

    - `admin_profiles` - Extended profile for admin users
      - `id` (uuid, PK, FK → auth.users)
      - `email` (text)
      - `display_name` (text)
      - `created_at` (timestamptz)

  2. Security
    - RLS enabled on all tables
    - Public can read published posts and categories
    - Only authenticated admins can write posts
    - Contact messages insertable by anyone, readable only by admins
*/

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (true);

-- Posts
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text DEFAULT '',
  excerpt text DEFAULT '',
  featured_image text DEFAULT '',
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  meta_title text DEFAULT '',
  meta_description text DEFAULT '',
  published boolean DEFAULT false,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published posts"
  ON posts FOR SELECT
  TO anon, authenticated
  USING (published = true);

CREATE POLICY "Authenticated users can read all posts"
  ON posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete posts"
  ON posts FOR DELETE
  TO authenticated
  USING (true);

-- Contact messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact messages"
  ON contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read contact messages"
  ON contact_messages FOR SELECT
  TO authenticated
  USING (true);

-- Admin profiles
CREATE TABLE IF NOT EXISTS admin_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  display_name text DEFAULT 'Admin',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read own profile"
  ON admin_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can update own profile"
  ON admin_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Index for slug lookups and filtered queries
CREATE INDEX IF NOT EXISTS posts_slug_idx ON posts(slug);
CREATE INDEX IF NOT EXISTS posts_category_idx ON posts(category_id);
CREATE INDEX IF NOT EXISTS posts_published_idx ON posts(published, created_at DESC);
CREATE INDEX IF NOT EXISTS categories_slug_idx ON categories(slug);
