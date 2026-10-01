alter table public.bookings
  add column if not exists rental_terms_version text,
  add column if not exists rental_terms_accepted_at timestamptz;
