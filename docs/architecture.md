# Architecture

## Recommendation

Use one TypeScript Expo app and one Supabase project. This minimizes integration surfaces while still providing native UI, auth, relational data, realtime updates, file storage, and server-side functions.

### Client

- Expo + React Native + TypeScript
- Expo Router for route groups and protected navigation
- NativeWind for Tailwind-style classes; React Native does not use browser `tailwind.css` directly
- React Hook Form + Zod only if forms become cumbersome; otherwise avoid dependencies
- TanStack Query only if server-state invalidation becomes difficult; start with a small typed data layer

### Backend

- Supabase Auth for sessions and Microsoft/Azure OAuth when tenant access is available
- Postgres as the source of truth
- RLS on every exposed table and private Storage bucket
- Realtime Postgres changes for bookings and ride availability
- SQL functions/RPC for atomic seat acceptance and derived price calculations
- Edge Functions only for secret-bearing third-party calls or privileged workflows

### External services

- One geocoding/directions provider chosen for easiest keys and hackathon quota
- Static/configured fuel-cost assumption for MVP; label it clearly
- Expo notifications only after the core flow works

## Why not more

- A separate Node backend duplicates auth, deployment, types, and business logic.
- Redux is unnecessary for a small server-driven app.
- Custom E2EE is a security project of its own and conflicts with moderation/reporting requirements.
- Payments create legal, insurance, marketplace, and failure-mode complexity that does not improve the core demo.

## Proposed module boundaries

```text
src/
  app/                 Expo Router screens and layouts
  components/          reusable visual components
  features/
    auth/
    profiles/
    rides/
    bookings/
    ratings/
  lib/
    supabase.ts
    maps.ts             only maps/directions interface
    pricing.ts          pure price-estimate logic
    validation.ts
  theme/
    tokens.ts
supabase/
  migrations/
  seed.sql
  tests/
```

Screens may call feature hooks/services, not raw Supabase tables or third-party APIs.

## Data model

Use UUID primary keys, `created_at`/`updated_at`, UTC timestamps, integer cents, and explicit constraints.

| Table | Purpose | Important fields |
| --- | --- | --- |
| `profiles` | Public and private user profile | `id = auth.uid`, first name, avatar, school, graduation year, `verification_status`, rating aggregate |
| `vehicles` | Driver vehicle | owner, make, model, color, plate (restricted), seats |
| `rides` | Scheduled offer | driver, origin/destination text + coordinates, departure, capacity, status, price cents, price source |
| `ride_stops` | Ordered optional stops | ride, sequence, place text + coordinates |
| `bookings` | Seat request and decision | ride, rider, seats, status, decision timestamp |
| `ratings` | Post-ride accountability | ride, author, subject, stars, optional note |
| `reports` | Private safety/moderation report | ride, reporter, subject, category, details, status |
| `receipts` | Optional gas receipt metadata | ride, uploader, private object path, amount, review status |

Suggested enums:

- `verification_status`: `unverified`, `school_email`, `manual_review`
- `ride_status`: `scheduled`, `in_progress`, `completed`, `cancelled`
- `booking_status`: `pending`, `accepted`, `declined`, `cancelled`
- `price_source`: `suggested`, `driver_set`

Key constraints:

- unique booking per `(ride_id, rider_id)`
- unique rating per `(ride_id, author_id, subject_id)`
- capacity and requested seats greater than zero
- departure in the future at creation
- price not negative
- driver cannot be rider on the same ride

## Seat consistency

Do not decrement a client-writable counter. Accept requests through one database function that:

1. locks the ride and relevant bookings;
2. verifies caller owns the ride and its status is `scheduled`;
3. sums accepted seats;
4. rejects the request if capacity would be exceeded;
5. updates the booking and returns derived remaining seats.

Discovery can expose a view or query that calculates `capacity - accepted_seats`. Subscribe to booking changes for the current ride and invalidate/refetch the ride query.

## Pricing

For the MVP, make the estimate transparent and deterministic:

```text
trip_cost = distance_miles / assumed_mpg * fuel_price_per_gallon + tolls
suggested_per_rider = round_up(trip_cost / expected_total_people)
```

Store the assumptions used with the ride estimate so the result remains explainable. Let a driver override the price, but label it `driver_set`. Do not fetch live gas prices unless the core flow is complete; a configurable local average is sufficient for a hackathon.

## Identity and Poly ID

Preferred path:

1. Use Supabase Azure provider with an organization-specific Microsoft Entra tenant if Cal Poly grants app-registration access.
2. Request only necessary identity scopes and verify the returned tenant/email claims server-side.
3. If tenant setup is unavailable, use Supabase email magic link restricted to the approved school domain.
4. Display “school email verified,” not “identity verified.”

An email-domain suffix checked only in the client is not verification. A raw Poly ID image is sensitive and offers little hackathon value. If document verification is required later, store it in a private bucket, restrict access to owner plus reviewer, log review state separately, and define deletion/retention before collecting it.

## Messaging and encryption

Private messages protected by TLS, Supabase auth, and RLS are encrypted in transit and access-controlled, but they are not end-to-end encrypted. For MVP, either omit chat or provide participant-only messages with accurate wording. True E2EE would require client key generation, key verification/recovery, encrypted notification previews, and a moderation design.

## Maps and route matching

Start with normalized origin/destination coordinates and text. Exact/nearby filters can use bounding boxes or PostGIS radius queries. Route-corridor matching is P1 because it requires route geometry, a distance-to-line query, and thoughtful pickup detour limits.

Keep provider-specific results behind:

```ts
interface MapsService {
  searchPlaces(query: string): Promise<Place[]>;
  getRoute(stops: Place[]): Promise<RouteSummary>;
}
```

Cache the chosen place text/coordinates and route summary on the ride. The demo must have a fallback if the external API quota or network fails.

## Security checklist

- RLS enabled and tested on every exposed table
- publishable key only in the client; service-role and provider secrets server-side only
- private buckets for receipts or identity documents
- signed URLs with short expiry for authorized review
- plate/contact fields returned only to accepted participants
- server/database authorization for all status changes
- rate limits on ride creation, requests, messages, and reports before production
- no sensitive values in logs, analytics, seed data, screenshots, or error messages

## Testing strategy

- Unit-test pricing, date validation, status transitions, and seat calculations.
- Database-test RLS allow/deny and concurrent seat acceptance.
- Component-test the create/request forms only if time allows.
- Maintain one manual two-user smoke script matching `docs/product.md`.
- Before judging, run the smoke script on the exact device/network and preserve seeded fallback data.

## Official references

- [Expo authentication](https://docs.expo.dev/develop/authentication/)
- [Expo Router authentication](https://docs.expo.dev/router/advanced/authentication/)
- [Supabase with Expo](https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native)
- [Supabase Azure sign-in](https://supabase.com/docs/guides/auth/social-login/auth-azure)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control)
- [NativeWind installation](https://www.nativewind.dev/docs/getting-started/installation)

