# Shotgun

Shotgun is a student rideshare coordination app for finding and filling trusted, scheduled rides. It replaces an unstructured social-media post with searchable rides, verified student accounts, seat requests, live availability, and lightweight accountability.

## Hackathon demo

The demo should tell one complete story:

1. A student signs in with a verified school email.
2. A driver creates a scheduled ride with origin, destination, time, seats, stops, and a suggested contribution.
3. A rider finds the ride using filters and requests a seat.
4. The driver accepts; both users see the updated status and remaining seats.
5. The ride is marked complete and both users can leave a rating.

Everything else is secondary. See [TASKS.md](TASKS.md) for the work queue and [docs/product.md](docs/product.md) for scope.

## Proposed stack

- Expo + React Native + TypeScript
- Expo Router for file-based navigation and protected routes
- NativeWind for Tailwind-style React Native styling
- Supabase Auth, Postgres, Realtime, Storage, and Edge Functions
- A single maps/directions provider behind a small adapter
- Vitest or Jest for logic tests; Maestro only if there is time for one smoke flow

## Repository map

- `AGENTS.md` — rules for Codex and contributors
- `TASKS.md` — prioritized, owned hackathon backlog
- `docs/product.md` — product scope and demo acceptance criteria
- `docs/architecture.md` — technical decisions, data model, and security boundaries
- `docs/team-workflow.md` — five-person GitHub and Codex workflow
- `docs/decisions.md` — short decision log and unresolved questions

## Start here

Before implementation, the team should answer the questions at the top of [docs/decisions.md](docs/decisions.md), agree on the hackathon deadline, and assign the five workstreams in [TASKS.md](TASKS.md).

