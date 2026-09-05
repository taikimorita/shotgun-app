-- Shotgun MVP schema, grants, RLS, and booking RPCs.
-- Remaining seats are derived; clients must not write availability.

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.verification_status as enum (
  'unverified',
  'school_email',
  'manual_review'
);

create type public.ride_status as enum (
  'scheduled',
  'in_progress',
  'completed',
  'cancelled'
);

create type public.booking_status as enum (
  'pending',
  'accepted',
  'declined',
  'cancelled'
);

create type public.price_source as enum (
  'suggested',
  'driver_set'
);

create type public.report_category as enum (
  'safety',
  'conduct',
  'other'
);

create type public.report_status as enum (
  'open',
  'reviewed'
);

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.email_domain(p_email text)
returns text
language sql
immutable
as $$
  select lower(split_part(coalesce(p_email, ''), '@', 2));
$$;

create or replace function public.is_approved_school_email(p_email text)
returns boolean
language sql
immutable
as $$
  select public.email_domain(p_email) = 'calpoly.edu';
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null check (char_length(first_name) between 1 and 80),
  avatar_url text,
  school text,
  graduation_year integer check (
    graduation_year is null
    or graduation_year between 2000 and 2100
  ),
  verification_status public.verification_status not null default 'unverified',
  rating_average numeric(3, 2) not null default 0
    check (rating_average >= 0 and rating_average <= 5),
  completed_ride_count integer not null default 0
    check (completed_ride_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  make text not null check (char_length(make) between 1 and 80),
  model text not null check (char_length(model) between 1 and 80),
  color text not null check (char_length(color) between 1 and 40),
  plate text not null check (char_length(plate) between 1 and 12),
  seat_count integer not null check (seat_count > 0 and seat_count <= 15),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rides (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.profiles (id) on delete restrict,
  vehicle_id uuid not null references public.vehicles (id) on delete restrict,
  origin_label text not null check (char_length(origin_label) between 1 and 200),
  origin_lat double precision not null check (origin_lat between -90 and 90),
  origin_lng double precision not null check (origin_lng between -180 and 180),
  destination_label text not null check (char_length(destination_label) between 1 and 200),
  destination_lat double precision not null check (destination_lat between -90 and 90),
  destination_lng double precision not null check (destination_lng between -180 and 180),
  departure_at timestamptz not null,
  display_timezone text not null default 'America/Los_Angeles',
  capacity integer not null check (capacity > 0 and capacity <= 15),
  status public.ride_status not null default 'scheduled',
  price_cents integer not null check (price_cents >= 0),
  price_source public.price_source not null,
  notes text check (notes is null or char_length(notes) <= 500),
  distance_meters integer check (distance_meters is null or distance_meters >= 0),
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  assumed_mpg numeric(5, 2) check (assumed_mpg is null or assumed_mpg > 0),
  fuel_price_cents_per_gallon integer check (
    fuel_price_cents_per_gallon is null or fuel_price_cents_per_gallon >= 0
  ),
  tolls_cents integer not null default 0 check (tolls_cents >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rides_origin_destination_distinct check (
    origin_label <> destination_label
    or origin_lat is distinct from destination_lat
    or origin_lng is distinct from destination_lng
  ),
  constraint rides_departure_after_create check (departure_at > created_at)
);

create table public.ride_stops (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references public.rides (id) on delete cascade,
  sequence integer not null check (sequence >= 0),
  label text not null check (char_length(label) between 1 and 200),
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  created_at timestamptz not null default now(),
  unique (ride_id, sequence)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references public.rides (id) on delete cascade,
  rider_id uuid not null references public.profiles (id) on delete restrict,
  seats integer not null default 1 check (seats = 1),
  status public.booking_status not null default 'pending',
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  unique (ride_id, rider_id)
);

create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references public.rides (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete restrict,
  subject_id uuid not null references public.profiles (id) on delete restrict,
  stars integer not null check (stars between 1 and 5),
  note text check (note is null or char_length(note) <= 500),
  created_at timestamptz not null default now(),
  constraint ratings_author_not_subject check (author_id <> subject_id),
  unique (ride_id, author_id, subject_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references public.rides (id) on delete cascade,
  reporter_id uuid not null references public.profiles (id) on delete restrict,
  subject_id uuid not null references public.profiles (id) on delete restrict,
  category public.report_category not null,
  details text not null check (char_length(details) between 1 and 2000),
  status public.report_status not null default 'open',
  created_at timestamptz not null default now(),
  constraint reports_reporter_not_subject check (reporter_id <> subject_id)
);

create index rides_discovery_idx on public.rides (departure_at)
  where status = 'scheduled';
create index rides_driver_idx on public.rides (driver_id, departure_at desc);
create index vehicles_owner_idx on public.vehicles (owner_id);
create index ride_stops_ride_idx on public.ride_stops (ride_id, sequence);
create index bookings_ride_status_idx on public.bookings (ride_id, status);
create index bookings_rider_idx on public.bookings (rider_id, created_at desc);
create index ratings_subject_idx on public.ratings (subject_id);
create index reports_reporter_idx on public.reports (reporter_id);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger vehicles_set_updated_at
  before update on public.vehicles
  for each row execute function public.set_updated_at();

create or replace function public.enforce_ride_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_accepted integer;
begin
  if new.driver_id <> old.driver_id then
    raise exception 'driver_locked' using errcode = '42501';
  end if;

  select coalesce(sum(seats), 0)::integer
  into v_accepted
  from public.bookings
  where ride_id = old.id
    and status = 'accepted';

  if new.capacity < v_accepted then
    raise exception 'capacity_below_accepted' using errcode = '22023';
  end if;

  return new;
end;
$$;

create trigger rides_set_updated_at
  before update on public.rides
  for each row execute function public.set_updated_at();

create trigger rides_enforce_update
  before update on public.rides
  for each row execute function public.enforce_ride_update();

-- ---------------------------------------------------------------------------
-- Auth: school-domain signup + profile bootstrap
-- ---------------------------------------------------------------------------

create or replace function public.enforce_school_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_approved_school_email(new.email) then
    raise exception 'school_email_required'
      using errcode = '22023';
  end if;
  return new;
end;
$$;

create trigger users_enforce_school_email
  before insert or update of email on auth.users
  for each row execute function public.enforce_school_email();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_first_name text;
begin
  v_first_name := nullif(trim(new.raw_user_meta_data ->> 'first_name'), '');
  if v_first_name is null then
    v_first_name := split_part(new.email, '@', 1);
  end if;

  insert into public.profiles (
    id,
    first_name,
    school,
    verification_status
  )
  values (
    new.id,
    v_first_name,
    'Cal Poly SLO',
    'school_email'
  );

  return new;
end;
$$;

create trigger users_handle_new_user
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Derived availability (never stored on rides)
-- ---------------------------------------------------------------------------

create or replace function public.remaining_seats(p_ride_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select r.capacity - coalesce((
    select sum(b.seats)::integer
    from public.bookings b
    where b.ride_id = p_ride_id
      and b.status = 'accepted'
  ), 0)
  from public.rides r
  where r.id = p_ride_id;
$$;

create or replace function public.is_ride_driver(p_ride_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.rides r
    where r.id = p_ride_id
      and r.driver_id = auth.uid()
  );
$$;

create or replace function public.is_accepted_participant(p_ride_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_ride_driver(p_ride_id)
    or exists (
      select 1
      from public.bookings b
      where b.ride_id = p_ride_id
        and b.rider_id = auth.uid()
        and b.status = 'accepted'
    );
$$;

create or replace function public.is_ride_visible(p_ride_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.rides r
    where r.id = p_ride_id
      and (
        r.status = 'scheduled'
        or r.driver_id = auth.uid()
        or exists (
          select 1
          from public.bookings b
          where b.ride_id = r.id
            and b.rider_id = auth.uid()
        )
      )
  );
$$;

create or replace view public.vehicles_public
with (security_invoker = false)
as
select
  id,
  owner_id,
  make,
  model,
  color,
  seat_count,
  created_at,
  updated_at
from public.vehicles;

create or replace view public.ride_listings
with (security_invoker = true)
as
select
  r.*,
  public.remaining_seats(r.id) as remaining_seats
from public.rides r;

-- ---------------------------------------------------------------------------
-- Ride / booking RPCs
-- ---------------------------------------------------------------------------

create or replace function public.request_booking(p_ride_id uuid)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id uuid;
  v_ride public.rides%rowtype;
begin
  select * into v_ride from public.rides where id = p_ride_id;
  if not found then
    raise exception 'ride_not_found' using errcode = 'P0002';
  end if;
  if v_ride.driver_id = auth.uid() then
    raise exception 'cannot_request_own_ride' using errcode = '42501';
  end if;
  if v_ride.status <> 'scheduled' then
    raise exception 'ride_not_scheduled' using errcode = '22023';
  end if;

  insert into public.bookings (ride_id, rider_id, seats, status)
  values (p_ride_id, auth.uid(), 1, 'pending')
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.accept_booking(p_booking_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ride public.rides%rowtype;
  v_booking public.bookings%rowtype;
  v_accepted integer;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  select r.*
  into v_ride
  from public.rides r
  join public.bookings b on b.ride_id = r.id
  where b.id = p_booking_id
  for update of r, b;

  if not found then
    raise exception 'booking_not_found' using errcode = 'P0002';
  end if;

  select * into v_booking
  from public.bookings
  where id = p_booking_id;

  if v_ride.driver_id <> auth.uid() then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  if v_ride.status <> 'scheduled' then
    raise exception 'ride_not_scheduled' using errcode = '22023';
  end if;
  if v_booking.status <> 'pending' then
    raise exception 'booking_not_pending' using errcode = '22023';
  end if;

  select coalesce(sum(seats), 0)::integer
  into v_accepted
  from public.bookings
  where ride_id = v_ride.id
    and status = 'accepted';

  if v_accepted + v_booking.seats > v_ride.capacity then
    raise exception 'no_seats' using errcode = 'P0001';
  end if;

  update public.bookings
  set status = 'accepted',
      decided_at = now()
  where id = p_booking_id;

  return v_ride.capacity - (v_accepted + v_booking.seats);
end;
$$;

create or replace function public.decline_booking(p_booking_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_driver_id uuid;
  v_status public.booking_status;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  select r.driver_id, b.status
  into v_driver_id, v_status
  from public.bookings b
  join public.rides r on r.id = b.ride_id
  where b.id = p_booking_id
  for update of b;

  if not found then
    raise exception 'booking_not_found' using errcode = 'P0002';
  end if;
  if v_driver_id <> auth.uid() then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  if v_status <> 'pending' then
    raise exception 'booking_not_pending' using errcode = '22023';
  end if;

  update public.bookings
  set status = 'declined',
      decided_at = now()
  where id = p_booking_id;
end;
$$;

create or replace function public.cancel_booking(p_booking_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.bookings%rowtype;
  v_ride_status public.ride_status;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  select * into v_booking
  from public.bookings
  where id = p_booking_id
  for update;

  if not found then
    raise exception 'booking_not_found' using errcode = 'P0002';
  end if;

  select r.status into v_ride_status
  from public.rides r
  where r.id = v_booking.ride_id;
  if v_booking.rider_id <> auth.uid() then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  if v_booking.status not in ('pending', 'accepted') then
    raise exception 'booking_not_cancellable' using errcode = '22023';
  end if;
  if v_ride_status not in ('scheduled', 'in_progress') then
    raise exception 'ride_not_active' using errcode = '22023';
  end if;

  update public.bookings
  set status = 'cancelled',
      decided_at = now()
  where id = p_booking_id;
end;
$$;

create or replace function public.start_ride(p_ride_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  update public.rides
  set status = 'in_progress'
  where id = p_ride_id
    and driver_id = auth.uid()
    and status = 'scheduled';

  if not found then
    raise exception 'cannot_start_ride' using errcode = '42501';
  end if;
end;
$$;

create or replace function public.complete_ride(p_ride_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  update public.rides
  set status = 'completed'
  where id = p_ride_id
    and driver_id = auth.uid()
    and status in ('scheduled', 'in_progress');

  if not found then
    raise exception 'cannot_complete_ride' using errcode = '42501';
  end if;
end;
$$;

create or replace function public.cancel_ride(p_ride_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  update public.rides
  set status = 'cancelled'
  where id = p_ride_id
    and driver_id = auth.uid()
    and status in ('scheduled', 'in_progress');

  if not found then
    raise exception 'cannot_cancel_ride' using errcode = '42501';
  end if;

  update public.bookings
  set status = 'cancelled',
      decided_at = now()
  where ride_id = p_ride_id
    and status = 'pending';
end;
$$;

create or replace function public.refresh_profile_rating(p_profile_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles p
  set rating_average = coalesce((
        select round(avg(r.stars)::numeric, 2)
        from public.ratings r
        where r.subject_id = p_profile_id
      ), 0),
      completed_ride_count = (
        select count(*)::integer
        from public.rides r
        where r.status = 'completed'
          and (
            r.driver_id = p_profile_id
            or exists (
              select 1
              from public.bookings b
              where b.ride_id = r.id
                and b.rider_id = p_profile_id
                and b.status = 'accepted'
            )
          )
      )
  where p.id = p_profile_id;
$$;

create or replace function public.submit_rating(
  p_ride_id uuid,
  p_subject_id uuid,
  p_stars integer,
  p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_ride public.rides%rowtype;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;
  if p_stars < 1 or p_stars > 5 then
    raise exception 'invalid_stars' using errcode = '22023';
  end if;

  select * into v_ride from public.rides where id = p_ride_id;
  if not found or v_ride.status <> 'completed' then
    raise exception 'ride_not_completed' using errcode = '22023';
  end if;

  if not public.is_accepted_participant(p_ride_id)
     and v_ride.driver_id <> auth.uid() then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  if p_subject_id = auth.uid() then
    raise exception 'cannot_rate_self' using errcode = '22023';
  end if;

  if p_subject_id <> v_ride.driver_id
     and not exists (
       select 1 from public.bookings b
       where b.ride_id = p_ride_id
         and b.rider_id = p_subject_id
         and b.status = 'accepted'
     ) then
    raise exception 'subject_not_participant' using errcode = '22023';
  end if;

  insert into public.ratings (ride_id, author_id, subject_id, stars, note)
  values (p_ride_id, auth.uid(), p_subject_id, p_stars, p_note)
  returning id into v_id;

  perform public.refresh_profile_rating(p_subject_id);

  return v_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

revoke all on schema public from anon, authenticated;
grant usage on schema public to anon, authenticated, service_role;

revoke all on all tables in schema public from anon, authenticated, public;
revoke all on all sequences in schema public from anon, authenticated, public;
revoke all on all functions in schema public from anon, authenticated, public;

grant usage on type public.verification_status to authenticated;
grant usage on type public.ride_status to authenticated;
grant usage on type public.booking_status to authenticated;
grant usage on type public.price_source to authenticated;
grant usage on type public.report_category to authenticated;
grant usage on type public.report_status to authenticated;

grant select on table public.profiles to authenticated;
grant update (first_name, avatar_url, school, graduation_year)
  on table public.profiles to authenticated;

grant select, insert, update, delete on table public.vehicles to authenticated;
grant select on table public.vehicles_public to authenticated;

grant select, insert on table public.rides to authenticated;
grant update (
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
  price_cents,
  price_source,
  notes,
  distance_meters,
  duration_seconds,
  assumed_mpg,
  fuel_price_cents_per_gallon,
  tolls_cents
) on table public.rides to authenticated;
grant select, insert, update, delete on table public.ride_stops to authenticated;

grant select, insert on table public.bookings to authenticated;
grant select, insert on table public.ratings to authenticated;
grant select, insert on table public.reports to authenticated;
grant select on table public.ride_listings to authenticated;

grant execute on function public.remaining_seats(uuid) to authenticated;
grant execute on function public.is_ride_visible(uuid) to authenticated;
grant execute on function public.is_ride_driver(uuid) to authenticated;
grant execute on function public.is_accepted_participant(uuid) to authenticated;
grant execute on function public.request_booking(uuid) to authenticated;
grant execute on function public.accept_booking(uuid) to authenticated;
grant execute on function public.decline_booking(uuid) to authenticated;
grant execute on function public.cancel_booking(uuid) to authenticated;
grant execute on function public.start_ride(uuid) to authenticated;
grant execute on function public.complete_ride(uuid) to authenticated;
grant execute on function public.cancel_ride(uuid) to authenticated;
grant execute on function public.submit_rating(uuid, uuid, integer, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.rides enable row level security;
alter table public.ride_stops enable row level security;
alter table public.bookings enable row level security;
alter table public.ratings enable row level security;
alter table public.reports enable row level security;

alter table public.profiles force row level security;
alter table public.vehicles force row level security;
alter table public.rides force row level security;
alter table public.ride_stops force row level security;
alter table public.bookings force row level security;
alter table public.ratings force row level security;
alter table public.reports force row level security;

create policy profiles_select_authenticated
  on public.profiles
  for select
  to authenticated
  using (true);

create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy vehicles_select_participants
  on public.vehicles
  for select
  to authenticated
  using (
    owner_id = auth.uid()
    or exists (
      select 1
      from public.rides r
      join public.bookings b on b.ride_id = r.id
      where r.vehicle_id = vehicles.id
        and b.status = 'accepted'
        and b.rider_id = auth.uid()
    )
  );

create policy vehicles_insert_own
  on public.vehicles
  for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy vehicles_update_own
  on public.vehicles
  for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy vehicles_delete_own
  on public.vehicles
  for delete
  to authenticated
  using (owner_id = auth.uid());

create policy rides_select_visible
  on public.rides
  for select
  to authenticated
  using (public.is_ride_visible(id));

create policy rides_insert_verified_driver
  on public.rides
  for insert
  to authenticated
  with check (
    driver_id = auth.uid()
    and departure_at > now()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.verification_status = 'school_email'
    )
    and exists (
      select 1 from public.vehicles v
      where v.id = vehicle_id
        and v.owner_id = auth.uid()
        and v.seat_count >= capacity
    )
  );

create policy rides_update_driver
  on public.rides
  for update
  to authenticated
  using (driver_id = auth.uid())
  with check (
    driver_id = auth.uid()
    and exists (
      select 1 from public.vehicles v
      where v.id = vehicle_id
        and v.owner_id = auth.uid()
    )
  );

create policy ride_stops_select_visible
  on public.ride_stops
  for select
  to authenticated
  using (public.is_ride_visible(ride_id));

create policy ride_stops_insert_driver
  on public.ride_stops
  for insert
  to authenticated
  with check (public.is_ride_driver(ride_id));

create policy ride_stops_update_driver
  on public.ride_stops
  for update
  to authenticated
  using (public.is_ride_driver(ride_id))
  with check (public.is_ride_driver(ride_id));

create policy ride_stops_delete_driver
  on public.ride_stops
  for delete
  to authenticated
  using (public.is_ride_driver(ride_id));

create policy bookings_select_involved
  on public.bookings
  for select
  to authenticated
  using (
    rider_id = auth.uid()
    or public.is_ride_driver(ride_id)
  );

create policy bookings_insert_rider
  on public.bookings
  for insert
  to authenticated
  with check (
    rider_id = auth.uid()
    and seats = 1
    and status = 'pending'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.verification_status = 'school_email'
    )
    and exists (
      select 1 from public.rides r
      where r.id = ride_id
        and r.status = 'scheduled'
        and r.driver_id <> auth.uid()
    )
  );

create policy ratings_select_authenticated
  on public.ratings
  for select
  to authenticated
  using (true);

create policy ratings_insert_participant
  on public.ratings
  for insert
  to authenticated
  with check (
    author_id = auth.uid()
    and author_id <> subject_id
    and exists (
      select 1 from public.rides r
      where r.id = ride_id
        and r.status = 'completed'
        and (
          r.driver_id = auth.uid()
          or exists (
            select 1 from public.bookings b
            where b.ride_id = r.id
              and b.rider_id = auth.uid()
              and b.status = 'accepted'
          )
        )
    )
  );

create policy reports_select_own
  on public.reports
  for select
  to authenticated
  using (reporter_id = auth.uid());

create policy reports_insert_own
  on public.reports
  for insert
  to authenticated
  with check (
    reporter_id = auth.uid()
    and reporter_id <> subject_id
    and (
      public.is_ride_driver(ride_id)
      or exists (
        select 1 from public.bookings b
        where b.ride_id = reports.ride_id
          and b.rider_id = auth.uid()
      )
    )
  );

-- Realtime for seat/status convergence on two demo clients.
alter table public.rides replica identity full;
alter table public.bookings replica identity full;

do $$
begin
  begin
    alter publication supabase_realtime add table public.rides;
  exception
    when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.bookings;
  exception
    when duplicate_object then null;
  end;
end;
$$;
