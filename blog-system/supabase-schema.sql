-- ================================================================
-- DIGITAL STORY STUDIO - BLOG SYSTEM
-- Supabase Schema - Run this in Supabase SQL Editor
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- POSTS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS posts (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title         TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  content       TEXT NOT NULL DEFAULT '',
  excerpt       TEXT DEFAULT '',
  featured_image TEXT DEFAULT '',

  -- Status: draft | scheduled | published
  status        TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published')),
  scheduled_at  TIMESTAMPTZ,
  published_at  TIMESTAMPTZ,

  -- SEO Fields (auto-generated + editable)
  seo_title     TEXT DEFAULT '',
  seo_description TEXT DEFAULT '',
  seo_keywords  TEXT DEFAULT '',

  -- Delhi NCR Geo Tags (auto-applied to every post)
  geo_region    TEXT DEFAULT 'IN-DL',
  geo_placename TEXT DEFAULT 'Delhi NCR, India',
  geo_lat       TEXT DEFAULT '28.6139',
  geo_lng       TEXT DEFAULT '77.2090',

  -- Blog Tags
  tags          TEXT[] DEFAULT '{}',

  -- Media embeds (Instagram/YouTube links stored as JSON array)
  media_embeds  JSONB DEFAULT '[]',

  -- Author
  author_name   TEXT DEFAULT 'Digital Story Studio',
  author_email  TEXT DEFAULT '',

  -- Timestamps
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),

  -- View count
  view_count    INTEGER DEFAULT 0
);

-- ================================================================
-- INDEXES for performance
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_at ON posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN(tags);

-- ================================================================
-- AUTO UPDATE updated_at trigger
-- ================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- AUTO SLUG GENERATOR (from title)
-- ================================================================
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
DECLARE
  slug TEXT;
BEGIN
  slug := LOWER(title);
  slug := REGEXP_REPLACE(slug, '[^a-z0-9\s-]', '', 'g');
  slug := REGEXP_REPLACE(slug, '\s+', '-', 'g');
  slug := REGEXP_REPLACE(slug, '-+', '-', 'g');
  slug := TRIM(BOTH '-' FROM slug);
  RETURN slug;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- AUTO-PUBLISH SCHEDULED POSTS
-- This function publishes posts whose scheduled_at has passed
-- Call this via Supabase Edge Functions cron (every 5 minutes)
-- ================================================================
CREATE OR REPLACE FUNCTION publish_scheduled_posts()
RETURNS void AS $$
BEGIN
  UPDATE posts
  SET
    status = 'published',
    published_at = NOW()
  WHERE
    status = 'scheduled'
    AND scheduled_at <= NOW()
    AND scheduled_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- INCREMENT VIEW COUNT
-- Called every time a blog post is viewed
-- ================================================================
CREATE OR REPLACE FUNCTION increment_view_count(post_slug TEXT)
RETURNS void AS $$
BEGIN
  UPDATE posts
  SET view_count = view_count + 1
  WHERE slug = post_slug
    AND status = 'published';
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================================
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Public can READ published posts only
CREATE POLICY "Public can read published posts"
  ON posts FOR SELECT
  USING (status = 'published');

-- Admin (authenticated) can do EVERYTHING
CREATE POLICY "Admin full access"
  ON posts FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ================================================================
-- STORAGE BUCKET for blog images
-- Run this in Supabase Dashboard > Storage
-- Or use the SQL below:
-- ================================================================

-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public to read images
CREATE POLICY "Public read blog images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-images');

-- Allow authenticated to upload/update/delete images
CREATE POLICY "Admin upload blog images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'blog-images' AND auth.role() = 'authenticated');

CREATE POLICY "Admin update blog images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'blog-images' AND auth.role() = 'authenticated');

CREATE POLICY "Admin delete blog images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'blog-images' AND auth.role() = 'authenticated');

-- ================================================================
-- SAMPLE DATA (Optional - remove in production)
-- ================================================================
INSERT INTO posts (
  title, slug, content, excerpt, status, published_at,
  seo_title, seo_description, seo_keywords, tags
) VALUES (
  'Best Wedding Videographer in Delhi NCR - Digital Story Studio',
  'best-wedding-videographer-delhi-ncr',
  '<h2>Capturing Your Most Precious Moments</h2><p>At Digital Story Studio, we believe every wedding tells a unique story. Our team of professional cinematographers and photographers captures every emotion, every laugh, every tear — turning your special day into a cinematic masterpiece you will treasure forever.</p><h2>Why Choose Us?</h2><p>With over 500 successful wedding projects across Delhi NCR, we bring unmatched expertise to every shoot. From intimate family gatherings in South Delhi to grand Punjabi weddings in Noida, we have documented love stories of every kind.</p><p>Our drone videography gives your wedding film that cinematic quality you see in Bollywood productions. Combined with our 4K cameras and professional lighting setup, every frame tells your story beautifully.</p>',
  'Learn why Digital Story Studio is Delhi NCR''s most trusted wedding videography and photography service.',
  'published',
  NOW(),
  'Best Wedding Videographer Delhi NCR | Digital Story Studio',
  'Award-winning wedding videographer in Delhi NCR. Cinematic wedding films, luxury photography, drone videography. 500+ weddings covered across Delhi, Noida & Gurgaon.',
  'wedding videographer delhi, wedding photographer delhi ncr, cinematic wedding films delhi, best wedding videography delhi, wedding photography noida',
  ARRAY['wedding', 'videography', 'delhi', 'ncr', 'tips']
);
