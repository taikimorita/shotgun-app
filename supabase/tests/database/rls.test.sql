begin;

create extension if not exists pgtap with schema extensions;

select plan(19);

-- Test identities (fictional).
select is(
  public.is_approved_school_email('maya.demo@calpoly.edu'),
  true,
  'approved school domain is accepted'
);

select is(
  public.is_approved_school_email('maya.demo@gmail.com'),
  false,
  'non-school domain is rejected'
);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token,
  email_change_token_new, email_change
) values
  (
    '00000000-0000-0000-0000-000000000000',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'authenticated', 'authenticated', 'driver.test@calpoly.edu',
    extensions.crypt('test', extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"first_name":"Driver"}'::jsonb, now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'authenticated', 'authenticated', 'rider.test@calpoly.edu',
    extensions.crypt('test', extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"first_name":"Rider"}'::jsonb, now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'authenticated', 'authenticated', 'stranger.test@calpoly.edu',
    extensions.crypt('test', extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"first_name":"Stranger"}'::jsonb, now(), now(), '', '', '', ''
  );

select throws_ok(
  $$insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000',
      'dddddddd-dddd-dddd-dddd-dddddddddddd',
      'authenticated', 'authenticated', 'not.school@example.com',
      extensions.crypt('test', extensions.gen_salt('bf')), now(), now(), now(),
      '', '', '', ''
    )$$,
  '22023',
  'school_email_required',
  'signup rejects non-school email'
);

select is(
  (select verification_status::text from public.profiles
    where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  'school_email',
  'new school-email user is marked school_email'
);

insert into public.vehicles (id, owner_id, make, model, color, plate, seat_count)
values (
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Toyota', 'Corolla', 'White', 'TEST 1', 2
);

insert into public.rides (
  id, driver_id, vehicle_id,
  origin_label, origin_lat, origin_lng,
  destination_label, destination_lat, destination_lng,
  departure_at, capacity, price_cents, price_source
) values (
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  'Cal Poly San Luis Obispo', 35.3050, -120.6625,
  'San Francisco International Airport', 37.6213, -122.3790,
  now() + interval '1 day', 1, 1000, 'suggested'
);

-- Unverified driver cannot create a ride.
update public.profiles
set verification_status = 'unverified'
where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}', true);
set local role authenticated;

select throws_ok(
  $$insert into public.rides (
      driver_id, vehicle_id,
      origin_label, origin_lat, origin_lng,
      destination_label, destination_lat, destination_lng,
      departure_at, capacity, price_cents, price_source
    ) values (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
      'Cal Poly', 35.3, -120.66,
      'SFO', 37.62, -122.38,
      now() + interval '2 days', 1, 500, 'suggested'
    )$$,
  'unverified driver cannot insert a ride'
);

reset role;
select set_config('request.jwt.claims', '', true);

update public.profiles
set verification_status = 'school_email'
where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

-- Anon cannot read profiles.
set local role anon;
select throws_ok(
  'select count(*) from public.profiles',
  '42501',
  'anon cannot select profiles'
);
reset role;

-- Rider can see the listing but not the plate before acceptance.
select set_config(
  'request.jwt.claims',
  '{"sub":"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb","role":"authenticated"}',
  true
);
set local role authenticated;

select is(
  (select remaining_seats from public.ride_listings
    where id = 'ffffffff-ffff-ffff-ffff-ffffffffffff'),
  1,
  'listing remaining seats equals capacity before acceptance'
);

select is(
  (select count(*)::integer from public.vehicles
    where id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
  0,
  'rider cannot read license plate before acceptance'
);

select isnt(
  (select make from public.vehicles_public
    where id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
  null,
  'public vehicle view exposes make without plate'
);

select lives_ok(
  $$select public.request_booking('ffffffff-ffff-ffff-ffff-ffffffffffff')$$,
  'verified rider can request a seat'
);

select throws_ok(
  $$select public.request_booking('ffffffff-ffff-ffff-ffff-ffffffffffff')$$,
  'duplicate request is rejected'
);

reset role;

-- Driver cannot request their own ride.
select set_config(
  'request.jwt.claims',
  '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}',
  true
);
set local role authenticated;

select throws_ok(
  $$select public.request_booking('ffffffff-ffff-ffff-ffff-ffffffffffff')$$,
  'driver cannot request their own ride'
);

select is(
  public.accept_booking((
    select id from public.bookings
    where ride_id = 'ffffffff-ffff-ffff-ffff-ffffffffffff'
      and rider_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
  )),
  0,
  'accepting the only seat returns zero remaining'
);

reset role;

select set_config(
  'request.jwt.claims',
  '{"sub":"cccccccc-cccc-cccc-cccc-cccccccccccc","role":"authenticated"}',
  true
);
set local role authenticated;

select lives_ok(
  $$select public.request_booking('ffffffff-ffff-ffff-ffff-ffffffffffff')$$,
  'a second rider may still request a full ride'
);

reset role;
select set_config(
  'request.jwt.claims',
  '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}',
  true
);
set local role authenticated;

select throws_ok(
  $$select public.accept_booking((
      select id from public.bookings
      where ride_id = 'ffffffff-ffff-ffff-ffff-ffffffffffff'
        and rider_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'
    ))$$,
  'P0001',
  'no_seats',
  'accept refuses to overbook'
);

reset role;

-- Stranger cannot accept someone else's booking.
insert into public.rides (
  id, driver_id, vehicle_id,
  origin_label, origin_lat, origin_lng,
  destination_label, destination_lat, destination_lng,
  departure_at, capacity, price_cents, price_source
) values (
  '99999999-9999-9999-9999-999999999999',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  'Cal Poly San Luis Obispo', 35.3050, -120.6625,
  'Los Angeles', 34.0522, -118.2437,
  now() + interval '3 days', 1, 800, 'suggested'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb","role":"authenticated"}',
  true
);
set local role authenticated;
select public.request_booking('99999999-9999-9999-9999-999999999999');
reset role;

select set_config(
  'request.jwt.claims',
  '{"sub":"cccccccc-cccc-cccc-cccc-cccccccccccc","role":"authenticated"}',
  true
);
set local role authenticated;

select throws_ok(
  $$select public.accept_booking((
      select id from public.bookings
      where ride_id = '99999999-9999-9999-9999-999999999999'
    ))$$,
  'unrelated user cannot accept a booking'
);

select is(
  (select count(*)::integer from public.bookings
    where ride_id = '99999999-9999-9999-9999-999999999999'),
  0,
  'unrelated user cannot read another rider booking'
);

reset role;

-- After acceptance, rider can see plate; reports stay private.
select set_config(
  'request.jwt.claims',
  '{"sub":"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb","role":"authenticated"}',
  true
);
set local role authenticated;

select is(
  (select plate from public.vehicles
    where id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
  'TEST 1',
  'accepted rider can read the plate'
);

insert into public.reports (ride_id, reporter_id, subject_id, category, details)
values (
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'other',
  'Demo private report'
);

reset role;
select set_config(
  'request.jwt.claims',
  '{"sub":"cccccccc-cccc-cccc-cccc-cccccccccccc","role":"authenticated"}',
  true
);
set local role authenticated;

select is(
  (select count(*)::integer from public.reports),
  0,
  'unrelated user cannot read reports'
);

select * from finish();
rollback;
