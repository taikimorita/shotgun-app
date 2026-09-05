# Shotgun engineering guardrails

These instructions apply to every human and Codex session in this repository.

## Product north star

Build the smallest reliable demo of a verified student posting a ride, another student requesting it, the driver accepting, and seat availability updating. Optimize for a polished judge-facing flow, not production breadth.

## Before changing code

1. Read the relevant issue plus `docs/product.md` and `docs/architecture.md`.
2. Inspect existing code and tests before proposing new abstractions.
3. State the issue acceptance criteria and list the files likely to change.
4. If the task needs a new service, dependency, table, secret, or product decision, record the choice in `docs/decisions.md`.

## Scope rules

- Implement only the assigned issue and its necessary tests.
- Prefer one vertical slice over reusable infrastructure without an immediate second use.
- Do not add payments, background location, custom encryption, OCR, an admin portal, or a second backend during the MVP.
- Do not introduce Redux or another global state library until React context plus server-state hooks demonstrably fail.
- Do not add a component library and NativeWind simultaneously. Use React Native primitives plus a small local component set.
- Do not call routing, maps, gas-price, identity, or notification APIs directly from screens. Keep each behind one typed module.
- Mock unavailable external services so the demo path remains deterministic.

## Security and privacy

- Every exposed Supabase table must have Row Level Security enabled and tested for allow and deny cases.
- Never put a Supabase service-role key, Microsoft client secret, maps secret, or any private key in the Expo bundle or Git.
- `EXPO_PUBLIC_*` values are public by design. Only publishable/anonymous client values belong there.
- Verify identity through auth claims where possible. For the MVP, store `verification_status`, provider, and timestamp—not Poly ID images.
- If document upload is later approved, use a private bucket, short retention, strict owner/admin policies, and no public URLs.
- Do not describe database or transport encryption as end-to-end encryption. True E2EE requires client-held keys and is out of MVP scope.
- Exact license plate and contact details are visible only to participants after acceptance.
- Collect the minimum location precision needed for the demo. Avoid continuous background location.

## Data and business invariants

- A ride's `seats_available` is derived from capacity minus accepted, non-cancelled bookings; clients must not freely write it.
- Seat acceptance must be atomic and must never overbook.
- Only the driver can edit, cancel, start, or complete their ride.
- A rider cannot request the same ride twice or request their own ride.
- Ratings require a completed ride and one rating per author/subject/ride.
- Reports are private to the reporter and reviewers.
- Money is represented as integer cents; distances use meters; times are UTC timestamps with an explicit display timezone.

## UI rules

- Build mobile-first for one agreed demo device.
- Every screen needs loading, empty, error, and disabled/submitting states where relevant.
- Use a shared color, spacing, radius, and typography token set; avoid one-off values.
- Favor a clean card-and-map visual language, large tap targets, and a single primary action per screen.
- Accessibility labels are required for icon-only buttons and form errors must be readable text.

## Testing and completion

An issue is complete only when:

- acceptance criteria pass on the agreed demo device;
- TypeScript and lint checks pass;
- new business logic has focused tests;
- schema changes are migrations with RLS policies;
- no secrets, debug logs, dead code, or unrelated formatting changes are included;
- the PR includes test evidence and screenshots for UI changes.

## Credit-conscious Codex use

- One Codex task owns one GitHub issue. Start a new task when the objective materially changes.
- Give Codex the issue, acceptance criteria, relevant file paths, and a stop condition. Do not use prompts such as “improve the app.”
- Ask Codex to inspect before editing and to summarize a plan in five bullets or fewer.
- Keep changes reviewable: aim for fewer than 400 changed lines per PR, excluding generated migrations/lockfiles.
- Do not have multiple teammates ask Codex to solve the same problem. Post findings to the issue first.
- Use the least expensive capable model for scaffolding, tests, copy, and small fixes; reserve deeper reasoning for schema, security, concurrency, and hard debugging.
- Run local typecheck/lint/tests before asking Codex to re-review. Provide exact error output rather than asking it to rediscover the failure.
- Stop after two failed approaches. Record what was tried, then ask a teammate or open a tightly scoped diagnostic task.
- Never ask Codex to repeatedly poll CI. Use GitHub notifications and inspect only failed jobs.

## Git hygiene

- Branch from current `main` as `feat/<issue>-short-name`, `fix/<issue>-short-name`, or `docs/<issue>-short-name`.
- Do not commit directly to `main` during active team development.
- Keep commits coherent and use imperative messages.
- Rebase or merge `main` before requesting review; never force-push another person's branch.
- One approval is enough for normal PRs. Auth, RLS, migrations, and seat-booking concurrency require review from the backend/security owner.

