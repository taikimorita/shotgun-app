# Auth setup

Verification means **school email**, not government identity and not Poly ID (see D-003 and D-004).

## Preferred path — Microsoft Entra / Azure

Use this when Cal Poly grants an app registration in the campus tenant.

1. Register a web app in the Entra tenant. Collect the tenant ID, client ID, and client secret.
2. In the Supabase dashboard, enable the Azure provider.
3. Set the secret in Supabase (never in `EXPO_PUBLIC_*` or Git).
4. Set the Azure URL to the tenant-specific OIDC endpoint:
   `https://login.microsoftonline.com/<tenant-id>/v2.0`
5. Restrict sign-in to that tenant. Request only email/profile scopes needed to show a name and verify the school mailbox.
6. The database trigger still requires `@calpoly.edu`. Users from the wrong tenant/domain cannot create a session that bootstraps a verified profile.

Local `supabase/config.toml` has `[auth.external.azure]` disabled. Enable it only with env-substituted secrets, never committed values.

## Fallback path — school-domain magic link

Use this for the hackathon if Entra access is not available (accepted default).

1. In Supabase Auth, enable email magic link / OTP.
2. Disable new signups from unknown domains if the dashboard allow-list is available; the `enforce_school_email` trigger is the server-side guarantee.
3. Confirm redirects include the Expo URL (`http://127.0.0.1:8081` locally, plus the production deep link when you have one).
4. Display **school email verified**, not “identity verified.”

Owner B’s client already uses the publishable URL + anon key. No extra Expo auth dependency is required for magic link.

## Demo accounts

Create two approved `@calpoly.edu` mailboxes (or aliases) before judging. They must be fictional student names (Maya / Jordan), not real personal data.

Local `supabase db reset` seeds:

- `maya.demo@calpoly.edu` / `ShotgunDemo!`
- `jordan.demo@calpoly.edu` / `ShotgunDemo!`
- Fallback ride `33333333-3333-3333-3333-333333333333` (Cal Poly → SFO, tomorrow 9:00 AM Pacific, three seats, downtown stop)

On the hosted project, after both users have signed in once, run this in the SQL editor as a privileged role:

```sql
-- Resolve IDs from Auth, then insert Maya's vehicle + fallback ride.
-- Skip if a demo ride already exists.

insert into public.vehicles (owner_id, make, model, color, plate, seat_count)
select p.id, 'Honda', 'Civic', 'Blue', 'DEMO 123', 4
from public.profiles p
join auth.users u on u.id = p.id
where u.email = 'maya.demo@calpoly.edu'
  and not exists (
    select 1 from public.vehicles v where v.owner_id = p.id
  );

insert into public.rides (
  driver_id, vehicle_id,
  origin_label, origin_lat, origin_lng,
  destination_label, destination_lat, destination_lng,
  departure_at, display_timezone, capacity, price_cents, price_source,
  notes, distance_meters, duration_seconds,
  assumed_mpg, fuel_price_cents_per_gallon, tolls_cents
)
select
  p.id,
  v.id,
  'Cal Poly San Luis Obispo', 35.3050, -120.6625,
  'San Francisco International Airport', 37.6213, -122.3790,
  (
    date_trunc('day', now() at time zone 'America/Los_Angeles')
    + interval '1 day' + interval '9 hours'
  ) at time zone 'America/Los_Angeles',
  'America/Los_Angeles',
  3, 1250, 'suggested',
  'One downtown SLO pickup before heading north.',
  370000, 14400, 30.00, 450, 0
from public.profiles p
join auth.users u on u.id = p.id
join public.vehicles v on v.owner_id = p.id
where u.email = 'maya.demo@calpoly.edu'
  and not exists (
    select 1 from public.rides r
    where r.driver_id = p.id
      and r.destination_label = 'San Francisco International Airport'
      and r.status = 'scheduled'
  );

insert into public.ride_stops (ride_id, sequence, label, lat, lng)
select r.id, 0, 'Downtown San Luis Obispo', 35.2828, -120.6596
from public.rides r
join auth.users u on u.id = r.driver_id
where u.email = 'maya.demo@calpoly.edu'
  and r.destination_label = 'San Francisco International Airport'
  and not exists (
    select 1 from public.ride_stops s where s.ride_id = r.id
  );
```
