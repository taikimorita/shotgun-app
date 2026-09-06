# Backend (Owner E)

Local Supabase is the source of truth for schema. The hosted project must apply the same migrations; never hand-edit production tables to match a demo.

## Ownership and recovery

- Keep the GitHub repo and the Supabase org on the team account, not a personal account that only one person can recover.
- At least two teammates must be Supabase org owners (or owner + developer with project access).
- Database history lives in `supabase/migrations/`. If the hosted project is lost, create a new project and run `npx supabase db push`.
- Do not put the service-role key, Azure secret, or database password in Git, `.env`, or the Expo bundle. Store them in the Supabase dashboard / a shared password manager.

## Local workflow

Requires Docker Desktop and the Supabase CLI (`npx supabase`).

```sh
npx supabase start
npx supabase db reset
npx supabase test db
npx supabase gen types typescript --local > src/types/database.ts
```

`db reset` applies migrations and `supabase/seed.sql`. Local demo logins:

| Role | Email | Password |
| --- | --- | --- |
| Driver (Maya) | `maya.demo@calpoly.edu` | `ShotgunDemo!` |
| Rider (Jordan) | `jordan.demo@calpoly.edu` | `ShotgunDemo!` |

Those accounts and the plate `DEMO 123` are fictional. Point the app at local Supabase:

```env
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon key from supabase start>
```

### Geoapify maps proxy

Find place search calls the authenticated `geoapify-maps` Edge Function. Keep the provider key server-side:

```sh
npx supabase secrets set GEOAPIFY_API_KEY=<key>
npx supabase functions deploy geoapify-maps
```

For local development, put `GEOAPIFY_API_KEY` in an ignored env file and serve the function with `npx supabase functions serve geoapify-maps --env-file <path>`. If the function or provider is unavailable, Find automatically uses the deterministic demo locations.

## Hosted project

1. Create the project in the shared org.
2. `npx supabase link --project-ref <ref>`
3. `npx supabase db push`
4. Configure auth as in `docs/auth.md`.
5. Create the two demo users with school emails, then insert the fallback ride (see `docs/auth.md`). Do not reuse local auth UUIDs unless you also created those users in hosted Auth.

## Client contract

- Discover rides through `ride_listings` (`remaining_seats` is derived).
- Vehicle make/model/color: `vehicles_public`. License plate: `vehicles`, only after acceptance.
- Create/update rides with inserts/updates; never write a `seats_available` column (it does not exist).
- Booking mutations: `request_booking`, `accept_booking`, `decline_booking`, `cancel_booking`.
- Ride status: `start_ride`, `complete_ride`, `cancel_ride`.
- Ratings: `submit_rating` after `complete_ride`.
