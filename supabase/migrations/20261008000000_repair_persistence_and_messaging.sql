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
  for each row execute function public.set_updated_at();

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

grant select, insert, update, delete on table public.vehicles to authenticated;
drop policy if exists "published vehicles are viewable" on public.vehicles;
create policy "published vehicles are viewable"
  on public.vehicles for select to anon, authenticated
  using (status = 'published' or provider_id = auth.uid());
drop policy if exists "providers manage own vehicles" on public.vehicles;
create policy "providers manage own vehicles"
  on public.vehicles for all to authenticated
  using (provider_id = auth.uid())
  with check (provider_id = auth.uid());

alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;

grant select on table public.conversations to authenticated;
grant select on table public.conversation_participants to authenticated;
revoke all on table public.messages from anon;
revoke update on table public.messages from authenticated;
grant select, insert on table public.messages to authenticated;
grant update (read_at) on table public.messages to authenticated;

create or replace function public.is_conversation_participant(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.conversation_participants cp
    where cp.conversation_id = p_conversation_id
      and cp.user_id = auth.uid()
  );
$$;
revoke all on function public.is_conversation_participant(uuid) from public, anon;
grant execute on function public.is_conversation_participant(uuid) to authenticated;

drop policy if exists "participants view conversations" on public.conversations;
create policy "participants view conversations"
  on public.conversations for select to authenticated
  using (public.is_conversation_participant(id));

drop policy if exists "participants view memberships" on public.conversation_participants;
create policy "participants view memberships"
  on public.conversation_participants for select to authenticated
  using (user_id = auth.uid() or public.is_conversation_participant(conversation_id));

drop policy if exists "participants view messages" on public.messages;
create policy "participants view messages"
  on public.messages for select to authenticated
  using (public.is_conversation_participant(conversation_id));

drop policy if exists "participants send messages" on public.messages;
create policy "participants send messages"
  on public.messages for insert to authenticated
  with check (sender_id = auth.uid() and public.is_conversation_participant(conversation_id));

drop policy if exists "participants mark received messages read" on public.messages;
create policy "participants mark received messages read"
  on public.messages for update to authenticated
  using (sender_id <> auth.uid() and public.is_conversation_participant(conversation_id))
  with check (sender_id <> auth.uid() and public.is_conversation_participant(conversation_id));

create or replace function public.get_conversation_participants()
returns table (
  conversation_id uuid,
  user_id uuid,
  full_name text,
  provider_name text
)
language sql
stable
security definer
set search_path = public
as $$
  select cp.conversation_id, cp.user_id, p.full_name, p.provider_name
  from public.conversation_participants cp
  join public.profiles p on p.id = cp.user_id
  where exists (
    select 1
    from public.conversation_participants own
    where own.conversation_id = cp.conversation_id
      and own.user_id = auth.uid()
  );
$$;
revoke all on function public.get_conversation_participants() from public, anon;
grant execute on function public.get_conversation_participants() to authenticated;

revoke all on function public.start_vehicle_conversation(uuid) from public, anon;
grant execute on function public.start_vehicle_conversation(uuid) to authenticated;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'messages'
     ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end;
$$;
