# Hackathon task list

Assumption: five people, roughly 24–48 hours, one polished mobile demo. Re-estimate after the open questions in `docs/decisions.md` are answered.

## Milestone 0 — align and unblock (all, first 60 minutes)

- [ ] **P0 / S / Lead:** Answer the nine open questions in `docs/decisions.md` and record changes.
- [ ] **P0 / S / A:** Create a six-screen low-fidelity flow: sign-in, discovery, ride details, create ride, requests, profile.
- [ ] **P0 / S / B:** Scaffold Expo TypeScript, Expo Router, NativeWind, lint, typecheck, test command, and `.env.example`.
- [x] **P0 / S / E:** Create Supabase project ownership/recovery plan and local migration workflow.
- [ ] **P0 / S / Lead:** Configure GitHub labels, issue/PR templates, branch protection, and CODEOWNERS.
- [ ] **P0 / S / All:** Agree on TypeScript contracts for `Profile`, `Ride`, `Booking`, `Place`, and `RouteSummary`.

Exit gate: every P0 item has one owner, app boots on the demo device, and no external credential is held by only one teammate.

## Milestone 1 — foundation (parallel)

### A — product/design

- [ ] **P0 / M:** Define color/type/spacing/radius tokens and build a small visual reference screen.
- [ ] **P0 / M:** Produce realistic demo copy, two profiles, vehicles, routes, empty states, and error text.
- [ ] **P0 / S:** Create app icon/splash and route-card visual assets.
- [ ] **P0 / S:** Write and time the three-minute demo script.

### B — client foundation

- [x] **P0 / M:** Implement public/authenticated route groups, session restoration, and sign-out.
- [x] **P0 / M:** Build shared `Screen`, `Button`, `Input`, `Card`, `Badge`, `Avatar`, `StatusPill`, and loading/empty/error components.
- [x] **P0 / S:** Add typed environment validation and Supabase client initialization.
- [x] **P0 / S:** Add a dev/demo account switch or documented two-session workflow without bypassing production authorization.

### C — rides frontend

- [ ] **P0 / M:** Build typed maps adapter with mock implementation and place-picker UI.
- [ ] **P0 / M:** Build ride creation form and validation.
- [ ] **P0 / M:** Build discovery feed and filter sheet using fixtures first.

### D — booking frontend

- [ ] **P0 / M:** Build ride-details screen from fixtures.
- [ ] **P0 / M:** Build request/accept/decline UI and status states against a mocked booking service.
- [ ] **P0 / S:** Build upcoming-rides/requests list shell.

### E — backend/security

- [x] **P0 / M:** Create migrations for profiles, vehicles, rides, stops, bookings, ratings, and reports.
- [x] **P0 / M:** Add grants, RLS policies, constraints, indexes, and allow/deny DB tests.
- [x] **P0 / M:** Configure school auth path and document fallback.
- [x] **P0 / S:** Create deterministic seed data for the demo story.

Exit gate: UI can run end-to-end on fixtures, schema resets cleanly, and auth works for at least one approved account.

## Milestone 2 — connect the core loop

### E + C

- [ ] **P0 / M:** Connect create ride and discovery queries to Supabase.
- [ ] **P0 / M:** Persist route summary, stops, pricing assumptions, and driver-set override.
- [ ] **P0 / S:** Add server-authorized ride edit/cancel/status transitions.

### E + D

- [ ] **P0 / M:** Implement atomic `accept_booking` function and concurrency tests.
- [ ] **P0 / M:** Connect request/accept/decline/cancel flow.
- [ ] **P0 / M:** Subscribe to relevant ride/booking changes and refetch derived availability.
- [ ] **P0 / S:** Implement complete ride and one-rating-per-participant rules.

### B + A

- [ ] **P0 / M:** Connect profile onboarding, vehicle form, and verification badge.
- [ ] **P0 / S:** Polish navigation, keyboard handling, safe areas, loading, empty, and error states.

Exit gate: the full two-user demo works against Supabase three consecutive times with no database edits.

## Milestone 3 — polish and resilience

- [ ] **P0 / M / A + B:** Visual consistency pass on the six primary screens.
- [ ] **P0 / S / C:** Add route preview; preserve a static/fixture fallback.
- [ ] **P0 / S / D:** Add report entry point and reassuring safety copy.
- [ ] **P0 / S / E:** Audit all RLS with anon, unrelated user, rider, and driver cases.
- [ ] **P0 / S / All:** Test loading, zero results, full ride, duplicate request, cancellation, API failure, and slow network.
- [ ] **P0 / S / Lead:** Freeze dependencies and features two hours before judging.
- [ ] **P0 / S / A:** Capture backup demo video/screenshots and prepare architecture slide.
- [ ] **P0 / S / All:** Rehearse handoffs, failure recovery, and judge Q&A.

## P1 backlog — pull only when every P0 exit gate passes

- [ ] **P1:** Push notifications for requests, decisions, and departure reminders.
- [ ] **P1:** Receipt image upload to a private bucket with manual “reviewed” status.
- [ ] **P1:** Participant-only in-app messages with RLS (not marketed as E2EE).
- [ ] **P1:** PostGIS nearby-origin/destination filters.
- [ ] **P1:** Route-corridor matching and maximum detour setting.
- [ ] **P1:** Luggage and approved comfort-preference filters.
- [ ] **P1:** Shareable ride summary for a trusted contact.
- [ ] **P1:** Block-user enforcement and basic report review queue.
- [ ] **P1:** Departure reminders and “driver arrived” status.

## Cut order when behind

Cut from the bottom upward without debate:

1. ratings and reports UI polish (retain basic entry points);
2. real route drawing (retain place text and distance fixture);
3. driver price override (retain suggested estimate);
4. realtime subscription (retain pull-to-refresh);
5. Microsoft OAuth (retain verified school-domain magic link);

Never cut atomic seat acceptance, authorization/RLS, the seeded fallback, or the primary demo flow.

## Final launch checklist

- [ ] `main` is green and tagged with the demo commit.
- [ ] `.env.example` is complete; no secrets are tracked.
- [ ] Database reset/seed instructions were tested by someone other than E.
- [ ] Demo accounts work and seeded data uses no real personal information.
- [ ] Device is charged, notifications are controlled, and network fallback is ready.
- [ ] Presenter can explain Microsoft/email verification, Poly ID privacy, pricing assumptions, RLS, and seat concurrency honestly.

