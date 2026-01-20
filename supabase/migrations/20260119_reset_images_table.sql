-- 1. Reset Images Table (As per user instruction to clear data)
DROP TABLE IF EXISTS public.images CASCADE;

-- 2. Create Enums
DROP TYPE IF EXISTS image_source_type;
CREATE TYPE image_source_type AS ENUM ('uploaded_cdn', 'external_url');

-- 3. Recreate Images Table
CREATE TABLE public.images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  artist_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Core Metadata
  title TEXT NOT NULL,
  topic TEXT NOT NULL, -- Broad topic
  description TEXT,
  
  -- Media Data
  url TEXT NOT NULL, -- The Full Public URL
  source_type image_source_type NOT NULL,
  source_metadata JSONB DEFAULT '{}'::JSONB, -- Store CDN public_id, original format, etc.
  
  -- Visual Data
  color_palette TEXT[], -- Array of hex codes
  
  -- Stats
  likes_count INT DEFAULT 0,
  
  -- Search Vector (Generated)
  fts tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(topic, '')), 'A')
  ) STORED
);

-- 4. Indexes
CREATE INDEX idx_images_fts ON public.images USING GIN(fts);
CREATE INDEX idx_images_artist ON public.images(artist_id);
CREATE INDEX idx_images_created_at ON public.images(created_at DESC);

-- 5. RLS Policies
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Images are viewable by everyone" 
ON public.images FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own images" 
ON public.images FOR INSERT 
WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "Users can update their own images" 
ON public.images FOR UPDATE 
USING (auth.uid() = artist_id);

CREATE POLICY "Users can delete their own images" 
ON public.images FOR DELETE 
USING (auth.uid() = artist_id);
