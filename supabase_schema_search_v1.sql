-- SEARCH SYSTEM V1 (Deterministic Relevance)
-- Implements "Canonical > Author > Title" ranking using weighted Full Text Search.

-- 1. Helper: Combined Search Vector
-- We create a function to generate the weighted vector dynamically or computed.
-- For v1, we'll do it inside the search function query or create a generated column.

-- Let's create a Generated Column for performance.
alter table public.images 
add column if not exists fts tsvector 
generated always as (
  setweight(to_tsvector('english', coalesce(title, '')), 'C') ||
  setweight(to_tsvector('english', coalesce(topic, '')), 'A') -- Topic/Domain is high value
) stored;

create index if not exists idx_images_fts on public.images using gin(fts);

-- 2. SEARCH RPC Function
-- This function handles the RELEVANCE Ranking part.
-- Filters are applied *after* or *during* this, but conceptually separate.
-- For strict separation, we accept generic parameters and return IDs.

create or replace function search_images_scored(
  query_text text,
  input_limit int default 20
)
returns table (
  id uuid,
  rank float4
)
language sql
as $$
  with search_query as (
    select websearch_to_tsquery('english', query_text) as q
  ),
  ranked_images as (
     select 
        i.id,
        (
          -- Manual Weighting Logic implementation
          -- 1. Canonical Matches (Highest) - Need JOIN to check
          (
             select count(*) * 10.0 -- High multiplier for canonical
             from image_canonical_tags ict
             join canonical_tags ct on ct.id = ict.tag_id
             where to_tsvector('english', ct.name) @@ (select q from search_query)
             and ict.image_id = i.id
          ) +
          -- 2. Author Tag Matches (Medium)
          (
             select count(*) * 5.0 
             from author_tags at
             where to_tsvector('english', at.tag_text) @@ (select q from search_query)
             and at.image_id = i.id
          ) +
          -- 3. Title/Topic Matches (Lowest/Base) - uses fts column
          (ts_rank(i.fts, (select q from search_query)))
        ) as total_rank
     from public.images i
  )
  select 
    id,
    total_rank as rank
  from ranked_images
  where total_rank > 0
  order by total_rank desc, id desc
  limit input_limit;
$$;
