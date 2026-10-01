grant select, insert, update on table public.bookings to authenticated;
grant select, insert, update, delete on table public.vehicles to authenticated;
grant select, insert, update, delete on table public.vehicle_images to authenticated;
grant select, insert, update, delete on table public.vehicle_features to authenticated;
grant select, insert, update, delete on table storage.objects to authenticated;

insert into storage.buckets (id, name, public)
values ('vehicle-images', 'vehicle-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "vehicle images are publicly readable" on storage.objects;
create policy "vehicle images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'vehicle-images');

drop policy if exists "users upload their vehicle images" on storage.objects;
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

drop policy if exists "users update their vehicle images" on storage.objects;
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

drop policy if exists "users delete their vehicle images" on storage.objects;
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
