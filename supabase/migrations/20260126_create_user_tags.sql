-- Create user_tags table if it doesn't exist
-- This table allows users to tag images they reference (Personal Tags)

CREATE TABLE IF NOT EXISTS public.user_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    image_id UUID REFERENCES public.images(id) ON DELETE CASCADE NOT NULL,
    tag_text TEXT NOT NULL,
    
    -- Prevent duplicate tags for same user/image
    UNIQUE(user_id, image_id, tag_text)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_tags_user ON public.user_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tags_image ON public.user_tags(image_id);
CREATE INDEX IF NOT EXISTS idx_user_tags_tag_text ON public.user_tags(tag_text);

-- RLS
ALTER TABLE public.user_tags ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "User tags viewable by owner" ON public.user_tags;
CREATE POLICY "User tags viewable by owner" ON public.user_tags 
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can add their own tags" ON public.user_tags;
CREATE POLICY "Users can add their own tags" ON public.user_tags 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own tags" ON public.user_tags;
CREATE POLICY "Users can delete their own tags" ON public.user_tags 
    FOR DELETE USING (auth.uid() = user_id);
