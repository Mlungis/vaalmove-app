-- LexRidesZA / VaalMove Supabase schema
-- Run this in Supabase SQL Editor, then create a public "vehicle-images" bucket.

create extension if not exists pgcrypto;
create extension if not exists btree_gist with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  avatar_url text,
  is_provider boolean not null default false,
  provider_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.phone
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (length(trim(title)) > 0),
  category text not null check (category in (
    'cars', 'bakkies', 'minibuses', 'buses', 'trucks',
    'trailers', 'construction', 'agriculture'
  )),
  price_daily numeric(12, 2) not null check (price_daily >= 0),
  year integer check (year is null or year between 1900 and 2100),
  fuel text,
  transmission text,
  drivetrain text,
  seats integer check (seats > 0),
  description text,
  location_name text not null,
  latitude double precision check (latitude is null or latitude between -90 and 90),
  longitude double precision check (longitude is null or longitude between -180 and 180),
  status text not null default 'published' check (status in ('draft', 'published', 'paused', 'archived')),
  insurance_details text,
  min_rental_days integer not null default 1 check (min_rental_days > 0),
  weekend_surcharge_percent numeric(5, 2) not null default 0 check (weekend_surcharge_percent between 0 and 100),
  weekly_discount_percent numeric(5, 2) not null default 0 check (weekly_discount_percent between 0 and 100),
  cancellation_policy text,
  rating numeric(3, 2) not null default 0,
  review_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vehicle_images (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  storage_path text not null,
  display_order integer not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index vehicle_images_one_cover_idx
  on public.vehicle_images (vehicle_id)
  where is_cover;

create table public.vehicle_features (
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  feature text not null,
  primary key (vehicle_id, feature)
);

create table public.vehicle_availability (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  available_from date not null,
  available_to date not null,
  status text not null default 'available' check (status in ('available', 'blocked', 'booked')),
  check (available_to >= available_from)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_code text not null unique default 'VM' || upper(substr(encode(gen_random_bytes(5), 'hex'), 1, 10)),
  renter_id uuid not null references public.profiles(id),
  vehicle_id uuid not null references public.vehicles(id),
  pickup_at timestamptz not null,
  dropoff_at timestamptz not null,
  pickup_location text not null,
  dropoff_location text,
  subtotal numeric(12, 2) not null check (subtotal >= 0),
  total numeric(12, 2) not null check (total >= 0),
  status text not null default 'pending' check (status in (
    'pending', 'confirmed', 'active', 'completed', 'cancelled', 'rejected'
  )),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'pending', 'paid', 'refunded', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (dropoff_at > pickup_at)
);

create or replace function public.validate_booking_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  provider uuid;
begin
  select provider_id into provider
  from public.vehicles
  where id = new.vehicle_id and status = 'published';
  if provider is null then
    raise exception 'vehicle is not available for booking';
  end if;
  if provider = new.renter_id then
    raise exception 'vehicle providers cannot book their own vehicle';
  end if;
  return new;
end;
$$;

create trigger bookings_validate_insert
  before insert on public.bookings
  for each row execute function public.validate_booking_insert();

alter table public.bookings
  add constraint bookings_no_overlap
  exclude using gist (
    vehicle_id with =,
    tstzrange(pickup_at, dropoff_at) with &&
  )
  where (status in ('pending', 'confirmed', 'active'));

create or replace function public.enforce_booking_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  provider uuid;
begin
  select provider_id into provider from public.vehicles where id = old.vehicle_id;
  if auth.uid() = old.renter_id and auth.uid() is distinct from provider then
    if new.renter_id is distinct from old.renter_id
      or new.vehicle_id is distinct from old.vehicle_id
      or new.subtotal is distinct from old.subtotal
      or new.total is distinct from old.total
      or new.payment_status is distinct from old.payment_status
      or new.booking_code is distinct from old.booking_code
      or new.status is distinct from old.status and new.status <> 'cancelled' then
      raise exception 'renters may only cancel a booking';
    end if;
  end if;
  return new;
end;
$$;

create trigger bookings_enforce_update
  before update on public.bookings
  for each row execute function public.enforce_booking_update();

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  renter_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  review_text text,
  created_at timestamptz not null default now()
);

create table public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, vehicle_id)
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.conversation_participants (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary key (conversation_id, user_id)
);

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

revoke all on function public.is_conversation_participant(uuid) from public;
grant execute on function public.is_conversation_participant(uuid) to authenticated;

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (length(trim(body)) > 0),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  icon text,
  color text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.saved_locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text not null,
  address text not null,
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now()
);

create table public.tracking_locations (
  id bigint generated always as identity primary key,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  speed_kmh numeric(8, 2),
  recorded_at timestamptz not null default now()
);

create index vehicles_provider_id_idx on public.vehicles(provider_id);
create index vehicles_category_status_idx on public.vehicles(category, status);
create index bookings_renter_id_idx on public.bookings(renter_id);
create index bookings_vehicle_id_idx on public.bookings(vehicle_id);
create index tracking_locations_booking_time_idx on public.tracking_locations(booking_id, recorded_at desc);
create index messages_conversation_time_idx on public.messages(conversation_id, created_at);

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger vehicles_set_updated_at before update on public.vehicles
  for each row execute function public.set_updated_at();
create trigger bookings_set_updated_at before update on public.bookings
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.vehicle_images enable row level security;
alter table public.vehicle_features enable row level security;
alter table public.vehicle_availability enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;
alter table public.favorites enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.saved_locations enable row level security;
alter table public.tracking_locations enable row level security;

create policy "published vehicles are viewable"
  on public.vehicles for select
  using (status = 'published' or provider_id = auth.uid());

create policy "providers manage own vehicles"
  on public.vehicles for all
  using (provider_id = auth.uid())
  with check (provider_id = auth.uid());

create policy "vehicle media is publicly viewable"
  on public.vehicle_images for select
  using (exists (
    select 1 from public.vehicles v
    where v.id = vehicle_id and (v.status = 'published' or v.provider_id = auth.uid())
  ));

create policy "providers manage own vehicle media"
  on public.vehicle_images for all
  using (exists (select 1 from public.vehicles v where v.id = vehicle_id and v.provider_id = auth.uid()))
  with check (exists (select 1 from public.vehicles v where v.id = vehicle_id and v.provider_id = auth.uid()));

create policy "vehicle features are viewable"
  on public.vehicle_features for select using (true);

create policy "providers manage own features"
  on public.vehicle_features for all
  using (exists (select 1 from public.vehicles v where v.id = vehicle_id and v.provider_id = auth.uid()))
  with check (exists (select 1 from public.vehicles v where v.id = vehicle_id and v.provider_id = auth.uid()));

create policy "users view vehicle availability"
  on public.vehicle_availability for select using (true);

create policy "providers manage own availability"
  on public.vehicle_availability for all
  using (exists (select 1 from public.vehicles v where v.id = vehicle_id and v.provider_id = auth.uid()))
  with check (exists (select 1 from public.vehicles v where v.id = vehicle_id and v.provider_id = auth.uid()));

create policy "users manage own profile"
  on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());

create policy "published vehicle providers are viewable"
  on public.profiles for select using (
    id = auth.uid()
    or exists (select 1 from public.vehicles v where v.provider_id = profiles.id and v.status = 'published')
  );

create policy "users manage own favorites"
  on public.favorites for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "renters view own bookings"
  on public.bookings for select using (renter_id = auth.uid());

create policy "providers view bookings for own vehicles"
  on public.bookings for select using (
    exists (select 1 from public.vehicles v where v.id = vehicle_id and v.provider_id = auth.uid())
  );

create policy "renters create bookings"
  on public.bookings for insert with check (renter_id = auth.uid());

create policy "renters cancel own bookings"
  on public.bookings for update using (renter_id = auth.uid()) with check (renter_id = auth.uid());

create policy "providers update bookings for own vehicles"
  on public.bookings for update using (
    exists (select 1 from public.vehicles v where v.id = vehicle_id and v.provider_id = auth.uid())
  ) with check (
    exists (select 1 from public.vehicles v where v.id = vehicle_id and v.provider_id = auth.uid())
  );

create policy "users view reviews"
  on public.reviews for select using (true);

create policy "renters create reviews for own bookings"
  on public.reviews for insert with check (
    renter_id = auth.uid()
    and exists (
      select 1 from public.bookings b
      where b.id = reviews.booking_id
        and b.renter_id = auth.uid()
        and b.vehicle_id = reviews.vehicle_id
        and b.status = 'completed'
    )
  );

create policy "participants view conversations"
  on public.conversations for select using (
    public.is_conversation_participant(id)
  );

create policy "users create conversations"
  on public.conversations for insert to authenticated
  with check (auth.uid() is not null);

create policy "participants view memberships"
  on public.conversation_participants for select to authenticated
  using (user_id = auth.uid() or public.is_conversation_participant(conversation_id));

create policy "users add conversation participants"
  on public.conversation_participants for insert to authenticated
  with check (user_id = auth.uid() or public.is_conversation_participant(conversation_id));

create policy "participants view messages"
  on public.messages for select using (
    public.is_conversation_participant(conversation_id)
  );

create policy "participants send messages"
  on public.messages for insert with check (
    sender_id = auth.uid() and public.is_conversation_participant(conversation_id)
  );

create policy "users manage own notifications"
  on public.notifications for select using (user_id = auth.uid());

create policy "users update own notifications"
  on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "users manage own saved locations"
  on public.saved_locations for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "booking participants view tracking"
  on public.tracking_locations for select using (
    exists (
      select 1 from public.bookings b
      join public.vehicles v on v.id = b.vehicle_id
      where b.id = booking_id and (b.renter_id = auth.uid() or v.provider_id = auth.uid())
    )
  );

create policy "providers write tracking for active bookings"
  on public.tracking_locations for insert to authenticated
  with check (exists (
    select 1
    from public.bookings b
    join public.vehicles v on v.id = b.vehicle_id
    where b.id = tracking_locations.booking_id
      and v.provider_id = auth.uid()
      and b.status in ('confirmed', 'active')
  ));

do $$
begin
  begin
    alter publication supabase_realtime add table public.messages;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.notifications;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.bookings;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.tracking_locations;
  exception when duplicate_object then null;
  end;
end;
$$;

-- Storage paths must use: provider_uuid/vehicle_uuid/file-name.ext
insert into storage.buckets (id, name, public)
values ('vehicle-images', 'vehicle-images', true)
on conflict (id) do update set public = excluded.public;

create policy "vehicle images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'vehicle-images');

create policy "users upload their vehicle images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'vehicle-images'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1 from public.vehicles v
      where v.id::text = (storage.foldername(name))[2]
        and v.provider_id = auth.uid()
    )
  );

create policy "users update their vehicle images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'vehicle-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'vehicle-images'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1 from public.vehicles v
      where v.id::text = (storage.foldername(name))[2]
        and v.provider_id = auth.uid()
    )
  );

create policy "users delete their vehicle images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'vehicle-images'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1 from public.vehicles v
      where v.id::text = (storage.foldername(name))[2]
        and v.provider_id = auth.uid()
    )
  );

-- App-owned metadata that is not part of the payment provider or auth service.
-- Only non-sensitive payment metadata is stored; never store card numbers or CVVs.
create table if not exists public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null default 'card',
  label text not null,
  meta text,
  provider_token text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.notification_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  settings jsonb not null default '{"push":true,"email":true,"sms":false,"promotions":true}'::jsonb,
  updated_at timestamptz not null default now()
);

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

alter table public.payment_methods enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.job_posts enable row level security;

create policy "users manage own payment metadata"
  on public.payment_methods for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "users manage own notification preferences"
  on public.notification_preferences for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "users manage own job posts"
  on public.job_posts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
