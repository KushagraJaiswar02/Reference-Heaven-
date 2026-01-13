-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security for more details.
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check ((select auth.uid()) = id);

create policy "Users can update own profile." on profiles
  for update using ((select auth.uid()) = id);

-- Create a table for images
create table images (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  url text not null,
  width integer,
  height integer,
  artist_id uuid references profiles(id) on delete cascade not null,
  topic text,
  likes_count integer default 0
);

-- RLS for Images
alter table images enable row level security;

create policy "Images are viewable by everyone." on images
  for select using (true);

create policy "Users can upload images." on images
  for insert with check ((select auth.uid()) = artist_id);

create policy "Users can update their own images." on images
  for update using ((select auth.uid()) = artist_id);

create policy "Users can delete their own images." on images
  for delete using ((select auth.uid()) = artist_id);

-- Set up Storage Buckets
-- You will need to create a bucket named 'images' in your Supabase Storage manually or run:
insert into storage.buckets (id, name, public) 
values ('images', 'images', true);

-- Storage Policies
create policy "Images are publicly accessible." on storage.objects
  for select using (bucket_id = 'images');

create policy "Anyone can upload an image." on storage.objects
  for insert with check (bucket_id = 'images' AND auth.role() = 'authenticated');

create policy "Users can update their own image." on storage.objects
  for update using (bucket_id = 'images' AND auth.uid() = owner);
