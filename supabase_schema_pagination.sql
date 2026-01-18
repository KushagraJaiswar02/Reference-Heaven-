-- Pagination Indexes (Strict Cursor Support)
-- "Index (createdAt, _id)" as per user requirement.

-- 1. IMAGES FEED & SEARCH
-- Composite index for deterministic cursor paging on feed
create index if not exists idx_images_pagination on public.images(created_at desc, id desc);

-- 2. SAVED IMAGES PAGINATION
-- When showing "My Saved Images", we sort by when it was saved.
-- We need (user_id, created_at, id) for efficient "User's latest saves" paging.
create index if not exists idx_saves_pagination on public.saves(user_id, created_at desc, id desc);
ok
-- 3. COLLECTION IMAGES PAGINATION
-- When viewing a collection, we sort by added date.
create index if not exists idx_collection_images_pagination on public.collection_images(collection_id, created_at desc, id desc);

-- 4. USER PROFILE POSTS
-- "User Profile Posts" -> images where artist_id = X
create index if not exists idx_images_artist_pagination on public.images(artist_id, created_at desc, id desc);
