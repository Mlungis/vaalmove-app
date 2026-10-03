create table if not exists public.tracking_locations (
  id bigint generated always as identity primary key,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  speed_kmh numeric(8, 2),
  recorded_at timestamptz not null default now()
);

alter table public.tracking_locations
  add column if not exists user_id uuid references public.profiles(id) on delete cascade;

delete from public.tracking_locations
where recorded_at < now() - interval '2 minutes';

update public.tracking_locations tracking
set user_id = vehicles.provider_id
from public.bookings bookings
join public.vehicles vehicles on vehicles.id = bookings.vehicle_id
where tracking.booking_id = bookings.id
  and tracking.user_id is null;

with ranked_locations as (
  select id,
    row_number() over (
      partition by booking_id, user_id
      order by recorded_at desc, id desc
    ) as row_number
  from public.tracking_locations
  where user_id is not null
)
delete from public.tracking_locations tracking
using ranked_locations ranked
where tracking.id = ranked.id
  and ranked.row_number > 1;

create index if not exists tracking_locations_booking_time_idx
  on public.tracking_locations(booking_id, recorded_at desc);
create unique index if not exists tracking_locations_participant_idx
  on public.tracking_locations(booking_id, user_id);

create or replace function public.clear_ended_booking_tracking()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.tracking_locations
  where booking_id = new.id;
  return new;
end;
$$;

drop trigger if exists bookings_clear_ended_tracking on public.bookings;
create trigger bookings_clear_ended_tracking
  after update of status on public.bookings
  for each row
  when (new.status in ('completed', 'cancelled', 'rejected'))
  execute function public.clear_ended_booking_tracking();

alter table public.tracking_locations enable row level security;

grant select, insert, update, delete on table public.tracking_locations to authenticated;
grant usage, select on sequence public.tracking_locations_id_seq to authenticated;
revoke all on table public.tracking_locations from anon;
revoke all on sequence public.tracking_locations_id_seq from anon;

drop policy if exists "booking participants view tracking" on public.tracking_locations;
create policy "booking participants view tracking"
  on public.tracking_locations for select to authenticated
  using (
    exists (
      select 1
      from public.bookings b
      join public.vehicles v on v.id = b.vehicle_id
      where b.id = tracking_locations.booking_id
        and (b.renter_id = auth.uid() or v.provider_id = auth.uid())
    )
  );

drop policy if exists "providers write tracking for active bookings" on public.tracking_locations;
drop policy if exists "booking participants write tracking for confirmed bookings" on public.tracking_locations;
create policy "booking participants write tracking for confirmed bookings"
  on public.tracking_locations for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.bookings b
      join public.vehicles v on v.id = b.vehicle_id
      where b.id = tracking_locations.booking_id
        and (b.renter_id = auth.uid() or v.provider_id = auth.uid())
        and b.status in ('confirmed', 'active')
    )
  );

drop policy if exists "users update their own tracking location" on public.tracking_locations;
create policy "users update their own tracking location"
  on public.tracking_locations for update to authenticated
  using (
    user_id = auth.uid()
    and exists (
      select 1
      from public.bookings b
      join public.vehicles v on v.id = b.vehicle_id
      where b.id = tracking_locations.booking_id
        and (b.renter_id = auth.uid() or v.provider_id = auth.uid())
        and b.status in ('confirmed', 'active')
    )
  )
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.bookings b
      join public.vehicles v on v.id = b.vehicle_id
      where b.id = tracking_locations.booking_id
        and (b.renter_id = auth.uid() or v.provider_id = auth.uid())
        and b.status in ('confirmed', 'active')
    )
  );

drop policy if exists "users delete their own tracking locations" on public.tracking_locations;
create policy "users delete their own tracking locations"
  on public.tracking_locations for delete to authenticated
  using (user_id = auth.uid());

do $$
begin
  alter publication supabase_realtime add table public.tracking_locations;
exception when duplicate_object then null;
end;
$$;
