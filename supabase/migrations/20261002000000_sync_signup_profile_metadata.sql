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
  on conflict (id) do update
    set full_name = case
          when profiles.full_name = '' then excluded.full_name
          else profiles.full_name
        end,
        phone = coalesce(profiles.phone, excluded.phone);
  return new;
end;
$$;

update public.profiles as profile
set full_name = coalesce(nullif(profile.full_name, ''), nullif(auth_user.raw_user_meta_data->>'full_name', ''), ''),
    phone = coalesce(profile.phone, nullif(auth_user.raw_user_meta_data->>'phone', ''), auth_user.phone)
from auth.users as auth_user
where auth_user.id = profile.id
  and (profile.full_name = '' or profile.phone is null);

alter table public.profiles enable row level security;
grant select, insert, update on table public.profiles to authenticated;

drop policy if exists "users manage own profile" on public.profiles;
create policy "users manage own profile"
  on public.profiles for all
  using (id = auth.uid())
  with check (id = auth.uid());
