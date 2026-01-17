-- Create tables for Manual Tagging System

-- DROP tables if they exist to ensure clean state (fixes missing column errors)
drop table if exists public.image_tags;
drop table if exists public.tags;

-- 1. Tags Table (Unique names)
create table public.tags (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Image Tags Junction Table
create table public.image_tags (
  id uuid default gen_random_uuid() primary key,
  image_id uuid references public.images(id) on delete cascade not null,
  tag_id uuid references public.tags(id) on delete cascade not null,
  user_id uuid references auth.users not null, -- Who added the tag
  category text not null, -- 'Pose', 'Angle', 'Lighting', 'Mood', 'Anatomy', 'Clothing', 'Color'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(image_id, tag_id, category) -- Prevent duplicate same-category tags for same image
);

-- 3. RLS Policies
alter table public.tags enable row level security;
alter table public.image_tags enable row level security;

-- Tags Policies
create policy "Tags are viewable by everyone"
on public.tags for select
using (true);

create policy "Authenticated users can create tags"
on public.tags for insert
with check (auth.role() = 'authenticated');

-- Image Tags Policies
create policy "Image tags are viewable by everyone"
on public.image_tags for select
using (true);

create policy "Authenticated users can add tags to images"
on public.image_tags for insert
with check (auth.role() = 'authenticated');

create policy "Users can delete their own image tags"
on public.image_tags for delete
using (auth.uid() = user_id);

create policy "Image owners can delete any tag on their image"
on public.image_tags for delete
using (
    exists (
        select 1 from public.images
        where images.id = image_tags.image_id
        and images.artist_id = auth.uid()
    )
);
