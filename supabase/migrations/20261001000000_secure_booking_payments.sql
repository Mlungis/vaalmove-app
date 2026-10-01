create table if not exists public.payment_attempts (
  reference text primary key,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount_minor integer not null check (amount_minor > 0),
  currency text not null default 'ZAR' check (currency = 'ZAR'),
  status text not null default 'initialized' check (status in ('initialized', 'success', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.conversations
  add column if not exists vehicle_id uuid references public.vehicles(id) on delete set null;

create table if not exists public.listing_reports (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null check (length(trim(reason)) > 0),
  details text,
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);

alter table public.listing_reports enable row level security;
grant select, insert on table public.listing_reports to authenticated;

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

drop policy if exists "users report published vehicles" on public.listing_reports;
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

drop policy if exists "users view own vehicle reports" on public.listing_reports;
create policy "users view own vehicle reports"
  on public.listing_reports for select to authenticated
  using (reporter_id = auth.uid());

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

alter table public.payment_attempts enable row level security;
revoke all on table public.payment_attempts from anon, authenticated;
grant all on table public.payment_attempts to service_role;

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

drop trigger if exists bookings_handle_events on public.bookings;
create trigger bookings_handle_events
  after insert or update of status, payment_status on public.bookings
  for each row execute function public.handle_booking_events();

drop policy if exists "users create conversations" on public.conversations;
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

drop policy if exists "users add conversation participants" on public.conversation_participants;
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

drop policy if exists "participants mark received messages read" on public.messages;
create policy "participants mark received messages read"
  on public.messages for update
  using (sender_id <> auth.uid() and public.is_conversation_participant(conversation_id))
  with check (sender_id <> auth.uid() and public.is_conversation_participant(conversation_id));

revoke update on table public.messages from authenticated;
grant select, insert on table public.messages to authenticated;
grant update (read_at) on table public.messages to authenticated;
