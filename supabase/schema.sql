-- LexRidesZA / VaalMove Supabase schema
-- Run this entire file in the Supabase SQL Editor. It creates the public
-- Listing and job-photo buckets, including their owner-scoped access policies.

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
    coalesce(nullif(new.raw_user_meta_data->>'phone', ''), new.phone)
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

create table public.listing_reports (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null check (length(trim(reason)) > 0),
  details text,
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
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
  rental_terms_version text,
  rental_terms_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (dropoff_at > pickup_at)
);

create table public.payment_attempts (
  reference text primary key,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount_minor integer not null check (amount_minor > 0),
  currency text not null default 'ZAR' check (currency = 'ZAR'),
  status text not null default 'initialized' check (status in ('initialized', 'success', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.validate_booking_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  vehicle public.vehicles%rowtype;
  rental_days integer;
begin
  if auth.uid() is null or new.renter_id is distinct from auth.uid() then
    raise exception 'booking renter must be the authenticated user';
  end if;

  select * into vehicle
  from public.vehicles
  where id = new.vehicle_id and status = 'published';
  if not found then
    raise exception 'vehicle is not available for booking';
  end if;
  if vehicle.provider_id = auth.uid() then
    raise exception 'vehicle providers cannot book their own vehicle';
  end if;

  rental_days := greatest(
    1,
    (new.dropoff_at at time zone 'Africa/Johannesburg')::date
      - (new.pickup_at at time zone 'Africa/Johannesburg')::date
  );
  if rental_days < vehicle.min_rental_days then
    raise exception 'booking does not meet the vehicle minimum rental period';
  end if;

  new.subtotal := round(vehicle.price_daily * rental_days, 2);
  new.total := new.subtotal;
  new.status := 'pending';
  new.payment_status := 'unpaid';
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
  if auth.role() = 'service_role' then
    return new;
  end if;

  select provider_id into provider from public.vehicles where id = old.vehicle_id;
  if new.renter_id is distinct from old.renter_id
    or new.vehicle_id is distinct from old.vehicle_id
    or new.pickup_at is distinct from old.pickup_at
    or new.dropoff_at is distinct from old.dropoff_at
    or new.pickup_location is distinct from old.pickup_location
    or new.dropoff_location is distinct from old.dropoff_location
    or new.subtotal is distinct from old.subtotal
    or new.total is distinct from old.total
    or new.payment_status is distinct from old.payment_status
    or new.booking_code is distinct from old.booking_code then
    raise exception 'booking details and payment status cannot be changed by app users';
  end if;

  if auth.uid() = old.renter_id then
    if new.status is distinct from old.status and new.status <> 'cancelled' then
      raise exception 'renters may only cancel a booking';
    end if;
  elsif auth.uid() = provider then
    if new.status not in ('pending', 'confirmed', 'active', 'completed', 'cancelled', 'rejected') then
      raise exception 'invalid provider booking status';
    end if;
    if new.status in ('confirmed', 'active', 'completed') and new.payment_status <> 'paid' then
      raise exception 'a booking must be paid before it can be confirmed';
    end if;
  else
    raise exception 'not authorized to update this booking';
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
  vehicle_id uuid references public.vehicles(id) on delete set null,
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

create or replace function public.start_vehicle_conversation(p_vehicle_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  renter uuid := auth.uid();
  provider uuid;
  conversation uuid;
begin
  if renter is null then
    raise exception 'authentication required';
  end if;

  select provider_id into provider
  from public.vehicles
  where id = p_vehicle_id and status = 'published';
  if provider is null then
    raise exception 'vehicle is not available';
  end if;
  if provider = renter then
    raise exception 'providers cannot message themselves';
  end if;

  select c.id into conversation
  from public.conversations c
  where (
    c.vehicle_id = p_vehicle_id
    or exists (
      select 1 from public.bookings b
      where b.id = c.booking_id and b.vehicle_id = p_vehicle_id
    )
  )
  and exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = c.id and cp.user_id = renter
  )
  and exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = c.id and cp.user_id = provider
  )
  order by c.created_at desc
  limit 1;

  if conversation is null then
    insert into public.conversations (vehicle_id)
    values (p_vehicle_id)
    returning id into conversation;
    insert into public.conversation_participants (conversation_id, user_id)
    values (conversation, renter), (conversation, provider);
  end if;
  return conversation;
end;
$$;

revoke all on function public.start_vehicle_conversation(uuid) from public, anon;
grant execute on function public.start_vehicle_conversation(uuid) to authenticated;

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

create or replace function public.handle_booking_events()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  provider uuid;
  conversation uuid;
begin
  select provider_id into provider
  from public.vehicles
  where id = new.vehicle_id;

  if tg_op = 'INSERT' then
    insert into public.conversations (booking_id)
    values (new.id)
    returning id into conversation;

    insert into public.conversation_participants (conversation_id, user_id)
    values (conversation, new.renter_id), (conversation, provider)
    on conflict do nothing;

    insert into public.notifications (user_id, title, body, icon, color)
    values (provider, 'New booking request', 'A renter has requested your vehicle.', 'calendar-outline', '#2F7FE0');
  elsif new.payment_status = 'paid' and old.payment_status is distinct from 'paid' then
    insert into public.notifications (user_id, title, body, icon, color)
    values
      (provider, 'Booking confirmed', 'Payment was received for one of your vehicles.', 'checkmark-circle-outline', '#2F9E75'),
      (new.renter_id, 'Payment received', 'Your vehicle booking is confirmed.', 'checkmark-circle-outline', '#2F9E75');
  elsif new.status in ('cancelled', 'rejected') and old.status is distinct from new.status then
    insert into public.notifications (user_id, title, body, icon, color)
    values (
      case when auth.uid() = new.renter_id then provider else new.renter_id end,
      case when new.status = 'cancelled' then 'Booking cancelled' else 'Booking declined' end,
      case when new.status = 'cancelled' then 'A booking was cancelled.' else 'A booking request was declined.' end,
      'alert-circle-outline',
      '#E58B45'
    );
  end if;
  return new;
end;
$$;

create trigger bookings_handle_events
  after insert or update of status, payment_status on public.bookings
  for each row execute function public.handle_booking_events();

create index vehicles_provider_id_idx on public.vehicles(provider_id);
create index vehicles_category_status_idx on public.vehicles(category, status);
create index bookings_renter_id_idx on public.bookings(renter_id);
create index bookings_vehicle_id_idx on public.bookings(vehicle_id);
create index tracking_locations_booking_time_idx on public.tracking_locations(booking_id, recorded_at desc);
create index messages_conversation_time_idx on public.messages(conversation_id, created_at);

create or replace function public.get_public_vehicle_booking_ranges()
returns table (vehicle_id uuid, start_date date, end_date date)
language sql
stable
security definer
set search_path = public
as $$
  select
    b.vehicle_id,
    (b.pickup_at at time zone 'Africa/Johannesburg')::date,
    (b.dropoff_at at time zone 'Africa/Johannesburg')::date
  from public.bookings b
  join public.vehicles v on v.id = b.vehicle_id
  where v.status = 'published'
    and b.status in ('pending', 'confirmed', 'active');
$$;

revoke all on function public.get_public_vehicle_booking_ranges() from public;
grant execute on function public.get_public_vehicle_booking_ranges() to anon, authenticated;

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger vehicles_set_updated_at before update on public.vehicles
  for each row execute function public.set_updated_at();
create trigger bookings_set_updated_at before update on public.bookings
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.listing_reports enable row level security;
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
alter table public.payment_attempts enable row level security;
revoke update on table public.messages from authenticated;
grant select, insert on table public.messages to authenticated;
grant update (read_at) on table public.messages to authenticated;

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

create policy "users report published vehicles"
  on public.listing_reports for insert to authenticated
  with check (
    reporter_id = auth.uid()
    and exists (
      select 1 from public.vehicles v
      where v.id = vehicle_id
        and v.status = 'published'
        and v.provider_id <> auth.uid()
    )
  );

create policy "users view own vehicle reports"
  on public.listing_reports for select to authenticated
  using (reporter_id = auth.uid());

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

grant select, insert, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.vehicles to authenticated;
grant select, insert, update, delete on table public.vehicle_images to authenticated;
grant select, insert, update, delete on table public.vehicle_features to authenticated;
grant select, insert on table public.listing_reports to authenticated;
grant select, insert, update on table public.bookings to authenticated;
revoke all on table public.payment_attempts from anon, authenticated;
grant all on table public.payment_attempts to service_role;

create or replace function public.mark_booking_payment_success(p_reference text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  payment public.payment_attempts%rowtype;
begin
  if auth.role() <> 'service_role' then
    raise exception 'only the payment service can confirm a payment';
  end if;

  select * into payment
  from public.payment_attempts
  where reference = p_reference
  for update;
  if not found then
    raise exception 'payment attempt not found';
  end if;

  if payment.status = 'success' then
    return payment.booking_id;
  end if;

  update public.bookings
  set payment_status = 'paid', status = 'confirmed'
  where id = payment.booking_id
    and renter_id = payment.user_id
    and status = 'pending'
    and payment_status in ('unpaid', 'pending');
  if not found then
    raise exception 'booking is no longer payable';
  end if;

  update public.payment_attempts
  set status = 'success', updated_at = now()
  where reference = p_reference;

  return payment.booking_id;
end;
$$;

revoke all on function public.mark_booking_payment_success(text) from public, anon, authenticated;
grant execute on function public.mark_booking_payment_success(text) to service_role;

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
  with check (
    exists (
      select 1
      from public.bookings b
      join public.vehicles v on v.id = b.vehicle_id
      where b.id = booking_id
        and (b.renter_id = auth.uid() or v.provider_id = auth.uid())
    )
  );

create policy "participants view memberships"
  on public.conversation_participants for select to authenticated
  using (user_id = auth.uid() or public.is_conversation_participant(conversation_id));

create policy "users add conversation participants"
  on public.conversation_participants for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.conversations c
      join public.bookings b on b.id = c.booking_id
      join public.vehicles v on v.id = b.vehicle_id
      where c.id = conversation_id
        and (b.renter_id = auth.uid() or v.provider_id = auth.uid())
    )
  );

create policy "participants view messages"
  on public.messages for select using (
    public.is_conversation_participant(conversation_id)
  );

create policy "participants send messages"
  on public.messages for insert with check (
    sender_id = auth.uid() and public.is_conversation_participant(conversation_id)
  );

create policy "participants mark received messages read"
  on public.messages for update
  using (sender_id <> auth.uid() and public.is_conversation_participant(conversation_id))
  with check (sender_id <> auth.uid() and public.is_conversation_participant(conversation_id));

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

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = excluded.public;

insert into storage.buckets (id, name, public)
values ('job-images', 'job-images', true)
on conflict (id) do update set public = excluded.public;

create policy "avatars are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "users manage their avatar"
  on storage.objects for all to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

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

create policy "job images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'job-images');

create policy "users upload their job images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'job-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

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

create policy "users delete their job images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'job-images'
    and (storage.foldername(name))[1] = auth.uid()::text
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

grant select, insert, update, delete on table public.job_posts to authenticated;
