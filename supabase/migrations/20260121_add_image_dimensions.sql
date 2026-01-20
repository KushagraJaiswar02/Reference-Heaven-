-- Add width and height to images table for aspect ratio calculations
ALTER TABLE public.images 
ADD COLUMN IF NOT EXISTS width INT DEFAULT 1000,
ADD COLUMN IF NOT EXISTS height INT DEFAULT 1000;
