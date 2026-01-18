-- Performance Indexing Strategy
-- addressing "Slow Search" and "Fake Performance" concerns.

-- 1. CANONICAL TAGS RELATIONS
-- The Primary Key covers (image_id, tag_id).
-- We need an index on tag_id to quickly find "All images with this tag".
create index if not exists idx_image_canonical_tags_tag_id on public.image_canonical_tags(tag_id);

-- 2. SAVED IMAGES BY USER
-- Optimize fetching "My Saved Images"
create index if not exists idx_saves_user_id on public.saves(user_id);
-- Optimize checking "Is this image saved by me?" (Composite)
create index if not exists idx_saves_user_image on public.saves(user_id, image_id);
-- Optimize sorting saved images by recent
create index if not exists idx_saves_created_at on public.saves(created_at desc);

-- 3. COLLECTIONS
-- Optimize fetching "My Collections"
create index if not exists idx_collections_user_id on public.collections(user_id);

-- Collection Items: Unique constraint (collection_id, image_id) covers collection lookups.
-- We need reverse lookup: "Which collections is this image in?" (e.g., for "Add to Collection" UI status)
create index if not exists idx_collection_images_image_id on public.collection_images(image_id);

-- 4. DOMAIN + TAG COMBINATIONS
-- Current unique constraint: (domain, category, name).
-- This handles "Domain" and "Domain + Category" filtering well.

-- Optimize: "Search tag by name" (ignoring domain/category)
create index if not exists idx_canonical_tags_name on public.canonical_tags(name);

-- Optimize: "Search tag by name WITHIN a specialized domain" (Skipping category)
-- Useful for "Search in Nature" -> "Forest" (without knowing it's "Type" category)
create index if not exists idx_canonical_tags_domain_name on public.canonical_tags(domain, name);

-- 5. GENERAL & SEARCH OPTIMIZATION
-- Author Tags: text search
create index if not exists idx_author_tags_search on public.author_tags using gin(to_tsvector('english', tag_text));

-- Images: Recent feed performance
create index if not exists idx_images_created_at on public.images(created_at desc);
-- Images: Topic filtering
create index if not exists idx_images_topic on public.images(topic);
-- Images: Artist filtering
create index if not exists idx_images_artist_id on public.images(artist_id);
