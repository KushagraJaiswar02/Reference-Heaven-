-- 3-Layer Tagging System Schema (V3 - Single File Migration)
-- Implements strict separation: Canonical (Platform), Author (Intent), User (Personal)
-- Includes "Broad Semantic Domains" Upgrade

-- 1. CLEANUP (Drop Everything to start fresh)
drop policy if exists "Canonical tags are viewable by everyone" on public.canonical_tags;
drop policy if exists "Image canonical tags are viewable by everyone" on public.image_canonical_tags;
drop policy if exists "Authors can assign canonical tags to their images" on public.image_canonical_tags;
drop policy if exists "Authors can remove canonical tags from their images" on public.image_canonical_tags;
drop policy if exists "Author tags viewable by everyone" on public.author_tags;
drop policy if exists "Authors can insert author tags" on public.author_tags;
drop policy if exists "Authors can delete author tags" on public.author_tags;
drop policy if exists "Users can see their own tags" on public.user_tags;
drop policy if exists "Users can insert their own tags" on public.user_tags;
drop policy if exists "Users can update their own tags" on public.user_tags;
drop policy if exists "Users can delete their own tags" on public.user_tags;

drop function if exists public.get_image_public_tags;

drop table if exists public.user_tags;
drop table if exists public.author_tags;
drop table if exists public.image_canonical_tags;
drop table if exists public.canonical_tags;
drop type if exists public.tag_domain;

-- 2. ENUMS (Updated for Broad Semantic Domains)
create type public.tag_domain as enum (
  'art_illustration',
  'fashion_apparel',
  'architecture_spaces',
  'vehicles_transport',
  'products_objects',
  'nature_environment',
  'other_experimental'
);

-- 3. CANONICAL TAGS (Platform Truth)
create table public.canonical_tags (
  id uuid default gen_random_uuid() primary key,
  domain public.tag_domain not null,
  category text not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(domain, category, name)
);

-- 4. IMAGE CANONICAL TAGS (Junction)
create table public.image_canonical_tags (
  image_id uuid references public.images(id) on delete cascade not null,
  tag_id uuid references public.canonical_tags(id) on delete cascade not null,
  confidence float default 1.0, -- Future proofing for AI
  source text default 'manual', -- 'manual', 'ai'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (image_id, tag_id)
);

-- 5. AUTHOR TAGS (Intent)
create table public.author_tags (
    id uuid default gen_random_uuid() primary key,
    image_id uuid references public.images(id) on delete cascade not null,
    author_id uuid references auth.users not null, -- Must match image owner
    tag_text text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint author_tags_text_len check (char_length(tag_text) > 0 and char_length(tag_text) <= 50)
);
create index idx_author_tags_image on public.author_tags(image_id);
create index idx_author_tags_text on public.author_tags(tag_text);

-- 6. USER TAGS (Personal)
create table public.user_tags (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users not null,
    image_id uuid references public.images(id) on delete cascade not null,
    tag_text text not null,
    is_public boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, image_id, tag_text),
    constraint user_tags_text_len check (char_length(tag_text) > 0 and char_length(tag_text) <= 50)
);
create index idx_user_tags_user on public.user_tags(user_id);
create index idx_user_tags_image on public.user_tags(image_id);

-- 7. RLS POLICIES

alter table public.canonical_tags enable row level security;
alter table public.image_canonical_tags enable row level security;
alter table public.author_tags enable row level security;
alter table public.user_tags enable row level security;

-- Canonical Tags (Read All, Write Admin Only - effectively read only for app)
create policy "Canonical tags are viewable by everyone"
on public.canonical_tags for select using (true);

-- Image Canonical Tags (Read All, Insert/Delete by Image Owner)
create policy "Image canonical tags are viewable by everyone"
on public.image_canonical_tags for select using (true);

create policy "Authors can assign canonical tags to their images"
on public.image_canonical_tags for insert
with check (
    exists (
        select 1 from public.images
        where images.id = image_canonical_tags.image_id
        and images.artist_id = auth.uid()
    )
);

create policy "Authors can remove canonical tags from their images"
on public.image_canonical_tags for delete
using (
    exists (
        select 1 from public.images
        where images.id = image_canonical_tags.image_id
        and images.artist_id = auth.uid()
    )
);

-- Author Tags (Read All, Insert/Delete by Image Owner)
create policy "Author tags viewable by everyone"
on public.author_tags for select using (true);

create policy "Authors can insert author tags"
on public.author_tags for insert
with check (
    auth.uid() = author_id
    and exists (
        select 1 from public.images
        where images.id = author_tags.image_id
        and images.artist_id = auth.uid()
    )
);

create policy "Authors can delete author tags"
on public.author_tags for delete
using (auth.uid() = author_id);

-- User Tags (Strict Owner Access)
create policy "Users can see their own tags"
on public.user_tags for select
using (auth.uid() = user_id);

create policy "Users can insert their own tags"
on public.user_tags for insert
with check (auth.uid() = user_id);

create policy "Users can update their own tags"
on public.user_tags for update
using (auth.uid() = user_id);

create policy "Users can delete their own tags"
on public.user_tags for delete
using (auth.uid() = user_id);

-- 8. PUBLIC AGGREGATES HELPER
-- Securely fetch public tag counts without exposing user IDs
create or replace function get_image_public_tags(input_image_id uuid)
returns table (tag_text text, count bigint)
language sql
security definer
as $$
  select tag_text, count(*) as count
  from public.user_tags
  where image_id = input_image_id
  and is_public = true
  group by tag_text
  order by count desc;
$$;

-- 9. SEED DATA (Broad Semantic Domains)
insert into public.canonical_tags (domain, category, name) values

-- 1. Art & Illustration
('art_illustration', 'subject', 'figure study'), ('art_illustration', 'subject', 'portrait'), ('art_illustration', 'subject', 'landscape'),
('art_illustration', 'pose', 'standing'), ('art_illustration', 'pose', 'sitting'), ('art_illustration', 'pose', 'dynamic'), ('art_illustration', 'pose', 'reclining'),
('art_illustration', 'anatomy', 'muscle structure'), ('art_illustration', 'anatomy', 'skeleton'), ('art_illustration', 'anatomy', 'hand study'),
('art_illustration', 'style', 'sketch'), ('art_illustration', 'style', 'painting'), ('art_illustration', 'style', 'line art'), ('art_illustration', 'style', 'digital'),

-- 2. Fashion & Apparel
('fashion_apparel', 'garment', 'dress'), ('fashion_apparel', 'garment', 'suit'), ('fashion_apparel', 'garment', 'outerwear'), ('fashion_apparel', 'garment', 'sportswear'),
('fashion_apparel', 'material', 'denim'), ('fashion_apparel', 'material', 'silk'), ('fashion_apparel', 'material', 'leather'), ('fashion_apparel', 'material', 'wool'),
('fashion_apparel', 'fit', 'loose'), ('fashion_apparel', 'fit', 'fitted'), ('fashion_apparel', 'fit', 'draped'),
('fashion_apparel', 'detail', 'folds'), ('fashion_apparel', 'detail', 'stitching'), ('fashion_apparel', 'detail', 'texture'),

-- 3. Architecture & Spaces
('architecture_spaces', 'space', 'interior'), ('architecture_spaces', 'space', 'exterior'), ('architecture_spaces', 'space', 'urban'), ('architecture_spaces', 'space', 'landscape'),
('architecture_spaces', 'room', 'living room'), ('architecture_spaces', 'room', 'kitchen'), ('architecture_spaces', 'room', 'office'),
('architecture_spaces', 'style', 'modern'), ('architecture_spaces', 'style', 'brutalist'), ('architecture_spaces', 'style', 'classical'), ('architecture_spaces', 'style', 'industrial'),
('architecture_spaces', 'lighting', 'natural'), ('architecture_spaces', 'lighting', 'artificial'), ('architecture_spaces', 'lighting', 'mood'),

-- 4. Vehicles & Transportation
('vehicles_transport', 'type', 'car'), ('vehicles_transport', 'type', 'motorcycle'), ('vehicles_transport', 'type', 'aircraft'), ('vehicles_transport', 'type', 'spacecraft'),
('vehicles_transport', 'view', 'exterior'), ('vehicles_transport', 'view', 'interior'), ('vehicles_transport', 'view', 'detail'),
('vehicles_transport', 'style', 'vintage'), ('vehicles_transport', 'style', 'futuristic'), ('vehicles_transport', 'style', 'industrial'),

-- 5. Products & Objects
('products_objects', 'type', 'electronic'), ('products_objects', 'type', 'furniture'), ('products_objects', 'type', 'tool'), ('products_objects', 'type', 'packaging'),
('products_objects', 'material', 'plastic'), ('products_objects', 'material', 'metal'), ('products_objects', 'material', 'wood'), ('products_objects', 'material', 'glass'),
('products_objects', 'focus', 'form'), ('products_objects', 'focus', 'function'), ('products_objects', 'focus', 'ergonomics'),

-- 6. Nature & Environment
('nature_environment', 'type', 'forest'), ('nature_environment', 'type', 'ocean'), ('nature_environment', 'type', 'mountain'), ('nature_environment', 'type', 'desert'),
('nature_environment', 'time', 'day'), ('nature_environment', 'time', 'night'), ('nature_environment', 'time', 'golden hour'),
('nature_environment', 'weather', 'sunny'), ('nature_environment', 'weather', 'rain'), ('nature_environment', 'weather', 'snow'), ('nature_environment', 'weather', 'fog'),

-- 7. Other / Experimental
('other_experimental', 'subject', 'abstract'), ('other_experimental', 'subject', 'surreal'), ('other_experimental', 'subject', 'mixed media'),
('other_experimental', 'material', 'organic'), ('other_experimental', 'material', 'synthetic');
