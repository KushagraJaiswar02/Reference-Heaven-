create table if not exists follows (
  follower_id uuid references profiles(id) on delete cascade not null,
  followed_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (follower_id, followed_id)
);

alter table follows enable row level security;

create policy "Follows are viewable by everyone." on follows
  for select using (true);

create policy "Users can follow others." on follows
  for insert with check ((select auth.uid()) = follower_id);

create policy "Users can unfollow." on follows
  for delete using ((select auth.uid()) = follower_id);
