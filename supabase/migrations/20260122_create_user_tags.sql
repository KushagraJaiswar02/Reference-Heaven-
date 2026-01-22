
-- Create user_tags table for the tagging system
CREATE TABLE public.user_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    image_id UUID REFERENCES public.images(id) ON DELETE CASCADE NOT NULL,
    tag_text TEXT NOT NULL,
    
    -- Ensure unique tags per user per image to prevent duplicates
    UNIQUE(user_id, image_id, tag_text)
);

-- Indexes for performance
CREATE INDEX idx_user_tags_user ON public.user_tags(user_id);
CREATE INDEX idx_user_tags_image ON public.user_tags(image_id);
CREATE INDEX idx_user_tags_text ON public.user_tags(tag_text);

-- RLS
ALTER TABLE public.user_tags ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read tags
CREATE POLICY "Tags are viewable by everyone" 
ON public.user_tags FOR SELECT 
USING (true);

-- Policy: Users can create their own tags
CREATE POLICY "Users can add tags" 
ON public.user_tags FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own tags
CREATE POLICY "Users can remove their tags" 
ON public.user_tags FOR DELETE 
USING (auth.uid() = user_id);
