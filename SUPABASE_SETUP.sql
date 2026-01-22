
-- Run this script in your Supabase Dashboard SQL Editor to fix the missing tables.

BEGIN;

-- 1. Ensure Images table has dimensions
ALTER TABLE public.images 
ADD COLUMN IF NOT EXISTS width INT DEFAULT 1000,
ADD COLUMN IF NOT EXISTS height INT DEFAULT 1000;

-- 2. Create author_tags table (Matches Codebase)
CREATE TABLE IF NOT EXISTS public.author_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    image_id UUID REFERENCES public.images(id) ON DELETE CASCADE NOT NULL,
    tag_text TEXT NOT NULL,
    
    UNIQUE(author_id, image_id, tag_text)
);

-- Indexes for author_tags
CREATE INDEX IF NOT EXISTS idx_author_tags_author ON public.author_tags(author_id);
CREATE INDEX IF NOT EXISTS idx_author_tags_image ON public.author_tags(image_id);

-- RLS for author_tags
ALTER TABLE public.author_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Author tags viewable by everyone" ON public.author_tags;
CREATE POLICY "Author tags viewable by everyone" ON public.author_tags FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authors can add tags" ON public.author_tags;
CREATE POLICY "Authors can add tags" ON public.author_tags FOR INSERT WITH CHECK (auth.uid() = author_id);
DROP POLICY IF EXISTS "Authors can remove tags" ON public.author_tags;
CREATE POLICY "Authors can remove tags" ON public.author_tags FOR DELETE USING (auth.uid() = author_id);


-- 3. Create canonical_tags table
CREATE TABLE IF NOT EXISTS public.canonical_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    domain TEXT NOT NULL, -- e.g. 'visuals', 'concepts'
    category TEXT NOT NULL, -- e.g. 'composition', 'lighting'
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_canonical_tags_domain ON public.canonical_tags(domain);

-- RLS for canonical_tags (Read only for most users)
ALTER TABLE public.canonical_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Canonical tags viewable by everyone" ON public.canonical_tags;
CREATE POLICY "Canonical tags viewable by everyone" ON public.canonical_tags FOR SELECT USING (true);


-- 4. Create image_canonical_tags table
CREATE TABLE IF NOT EXISTS public.image_canonical_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    image_id UUID REFERENCES public.images(id) ON DELETE CASCADE NOT NULL,
    tag_id UUID REFERENCES public.canonical_tags(id) ON DELETE CASCADE NOT NULL,
    source TEXT DEFAULT 'manual', -- 'manual', 'ai', etc.
    confidence FLOAT DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT now(),

    UNIQUE(image_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_image_canonical_image ON public.image_canonical_tags(image_id);

-- RLS for image_canonical_tags
ALTER TABLE public.image_canonical_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Image canonical tags viewable by everyone" ON public.image_canonical_tags;
CREATE POLICY "Image canonical tags viewable by everyone" ON public.image_canonical_tags FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can add canonical tags" ON public.image_canonical_tags;
CREATE POLICY "Users can add canonical tags" ON public.image_canonical_tags FOR INSERT WITH CHECK (true);

COMMIT;
