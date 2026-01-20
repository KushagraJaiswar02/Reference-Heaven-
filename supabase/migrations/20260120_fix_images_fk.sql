-- The previous migration referenced auth.users(id).
-- While strict, this breaks PostgREST joins to public.profiles.
-- We need to reference public.profiles(id) to allow:
-- .select('*, profiles:artist_id(*)')

BEGIN;

-- 1. Try to drop the existing constraint (name might vary, so we try standard names)
--    Supabase usually names it images_artist_id_fkey
ALTER TABLE public.images 
DROP CONSTRAINT IF EXISTS images_artist_id_fkey;

-- 2. Add the correct constraint pointing to public.profiles
ALTER TABLE public.images
ADD CONSTRAINT images_artist_id_fkey
FOREIGN KEY (artist_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

COMMIT;
