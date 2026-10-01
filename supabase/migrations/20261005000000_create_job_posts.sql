create table if not exists public.job_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  job_type text not null,
  description text not null,
  budget numeric(12, 2) not null check (budget >= 0),
  date_needed text not null,
  contact text,
  photos jsonb not null default '[]'::jsonb,
  status text not null default 'open' check (status in ('open', 'closed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.job_posts enable row level security;

drop policy if exists "users manage own job posts" on public.job_posts;
create policy "users manage own job posts"
  on public.job_posts for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, update, delete on table public.job_posts to authenticated;

drop trigger if exists job_posts_set_updated_at on public.job_posts;
create trigger job_posts_set_updated_at
  before update on public.job_posts
  for each row execute procedure public.set_updated_at();

insert into storage.buckets (id, name, public)
values ('job-images', 'job-images', true)
on conflict (id) do update set public = excluded.public;

grant select, insert, update, delete on table storage.objects to authenticated;

drop policy if exists "job images are publicly readable" on storage.objects;
create policy "job images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'job-images');

drop policy if exists "users upload their job images" on storage.objects;
create policy "users upload their job images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'job-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "users update their job images" on storage.objects;
create policy "users update their job images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'job-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'job-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "users delete their job images" on storage.objects;
create policy "users delete their job images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'job-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
