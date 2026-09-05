-- Deterministic local demo story. All people, vehicles, and plates are fictional.
-- Hosted projects should create the two school-email users in Auth first, then
-- run the ride/vehicle inserts from docs/auth.md (IDs will differ).

create extension if not exists pgcrypto with schema extensions;

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'authenticated',
    'authenticated',
    'maya.demo@calpoly.edu',
    extensions.crypt('ShotgunDemo!', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"first_name":"Maya"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222222',
    'authenticated',
    'authenticated',
    'jordan.demo@calpoly.edu',
    extensions.crypt('ShotgunDemo!', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"first_name":"Jordan"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
on conflict (id) do nothing;

insert into auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    jsonb_build_object(
      'sub', '11111111-1111-1111-1111-111111111111',
      'email', 'maya.demo@calpoly.edu',
      'email_verified', true
    ),
    'email',
    '11111111-1111-1111-1111-111111111111',
    now(),
    now(),
    now()
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    jsonb_build_object(
      'sub', '22222222-2222-2222-2222-222222222222',
      'email', 'jordan.demo@calpoly.edu',
      'email_verified', true
    ),
    'email',
    '22222222-2222-2222-2222-222222222222',
    now(),
    now(),
    now()
  )
on conflict (provider, provider_id) do nothing;

update public.profiles
set
  first_name = 'Maya',
  school = 'Cal Poly SLO',
  graduation_year = 2027,
  verification_status = 'school_email'
where id = '11111111-1111-1111-1111-111111111111';

update public.profiles
set
  first_name = 'Jordan',
  school = 'Cal Poly SLO',
  graduation_year = 2026,
  verification_status = 'school_email'
where id = '22222222-2222-2222-2222-222222222222';

insert into public.vehicles (
  id,
  owner_id,
  make,
  model,
  color,
  plate,
  seat_count
)
values (
  '44444444-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111',
  'Honda',
  'Civic',
  'Blue',
  'DEMO 123',
  4
)
on conflict (id) do nothing;

insert into public.rides (
  id,
  driver_id,
  vehicle_id,
  origin_label,
  origin_lat,
  origin_lng,
  destination_label,
  destination_lat,
  destination_lng,
  departure_at,
  display_timezone,
  capacity,
  status,
  price_cents,
  price_source,
  notes,
  distance_meters,
  duration_seconds,
  assumed_mpg,
  fuel_price_cents_per_gallon,
  tolls_cents
)
values (
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  '44444444-4444-4444-4444-444444444444',
  'Cal Poly San Luis Obispo',
  35.3050,
  -120.6625,
  'San Francisco International Airport',
  37.6213,
  -122.3790,
  (
    date_trunc('day', now() at time zone 'America/Los_Angeles')
    + interval '1 day'
    + interval '9 hours'
  ) at time zone 'America/Los_Angeles',
  'America/Los_Angeles',
  3,
  'scheduled',
  1250,
  'suggested',
  'One downtown SLO pickup before heading north.',
  370000,
  14400,
  30.00,
  450,
  0
)
on conflict (id) do nothing;

insert into public.ride_stops (
  id,
  ride_id,
  sequence,
  label,
  lat,
  lng
)
values (
  '55555555-5555-5555-5555-555555555555',
  '33333333-3333-3333-3333-333333333333',
  0,
  'Downtown San Luis Obispo',
  35.2828,
  -120.6596
)
on conflict (id) do nothing;
