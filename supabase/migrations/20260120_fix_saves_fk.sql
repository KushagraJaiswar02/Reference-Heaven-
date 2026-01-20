-- The DROP TABLE images CASCADE removed the FK from saves.
-- We need to re-add it to allow joining saves -> images.

BEGIN;

-- 1. Clean up "Orphan" saves (pointing to images that were deleted)
DELETE FROM public.saves 
WHERE image_id NOT IN (SELECT id FROM public.images);

-- 2. Re-establish the Foreign Key
ALTER TABLE public.saves
DROP CONSTRAINT IF EXISTS saves_image_id_fkey;

ALTER TABLE public.saves
ADD CONSTRAINT saves_image_id_fkey
FOREIGN KEY (image_id)
REFERENCES public.images(id)
ON DELETE CASCADE;

COMMIT;
