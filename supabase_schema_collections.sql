-- Create tables for Multi-Collection Board System

-- 1. Collections Table
create table if not exists public.collections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Collection Images Junction Table
create table if not exists public.collection_images (
  id uuid default gen_random_uuid() primary key,
  collection_id uuid references public.collections(id) on delete cascade not null,
  image_id uuid references public.images(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(collection_id, image_id)
);

-- 3. RLS Policies (Security)
alter table public.collections enable row level security;
alter table public.collection_images enable row level security;

-- Policies for Collections
create policy "Users can view their own collections"
on public.collections for select
using (auth.uid() = user_id);

create policy "Users can insert their own collections"
on public.collections for insert
with check (auth.uid() = user_id);

create policy "Users can update their own collections"
on public.collections for update
using (auth.uid() = user_id);

create policy "Users can delete their own collections"
on public.collections for delete
using (auth.uid() = user_id);

-- Policies for Collection Images
-- Users can see images in collections they own
create policy "Users can view images in their collections"
on public.collection_images for select
using (
  exists (
    select 1 from public.collections
    where collections.id = collection_images.collection_id
    and collections.user_id = auth.uid()
  )
);

create policy "Users can add images to their collections"
on public.collection_images for insert
with check (
  exists (
    select 1 from public.collections
    where collections.id = collection_images.collection_id
    and collections.user_id = auth.uid()
  )
);

create policy "Users can remove images from their collections"
on public.collection_images for delete
using (
  exists (
    select 1 from public.collections
    where collections.id = collection_images.collection_id
    and collections.user_id = auth.uid()
  )
);
