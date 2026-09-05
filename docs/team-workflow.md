# Five-person hackathon workflow

## Workstream ownership

Assign one directly responsible owner to each stream. Owners integrate work; they do not have to write every line.

| Owner | Stream | Primary responsibility |
| --- | --- | --- |
| A: product/design | UX + demo | flows, visual system, copy, seed story, demo script |
| B: client foundation | app shell | Expo setup, navigation, auth session, shared components |
| C: rides frontend | discovery | create/edit ride, feed, filters, ride detail, maps adapter |
| D: booking frontend | interaction | request/accept UI, statuses, realtime, ratings/reports |
| E: backend/security | data | Supabase schema, migrations, RLS, auth provider, RPCs, seed data |

The backend/security owner must review auth, migrations, RLS, and seat-acceptance changes. The product/design owner gives the final UI/demo acceptance.

## GitHub setup

Create these labels:

- priority: `P0`, `P1`, `P2`
- area: `app`, `rides`, `bookings`, `backend`, `design`, `demo`
- state: `blocked`, `needs-review`
- effort: `S` (under 2h), `M` (2–4h), `L` (split before starting)

Protect `main` with:

- pull request required;
- one approval;
- passing typecheck/lint/test checks;
- conversation resolution;
- force pushes disabled.

During the final two hours, the team lead may switch to a documented “demo freeze” rule: only P0 fixes, one reviewer, immediate smoke test after merge.

## Issue template

```md
## Outcome
One sentence describing observable user value.

## Acceptance criteria
- [ ] Given/when/then behavior
- [ ] Loading, empty, and error states covered
- [ ] Test or manual verification specified

## Boundaries
In scope:
Out of scope:

## Files/interfaces
Likely files, tables, or APIs touched.

## Demo evidence
Screenshot/video/log to attach to the PR.
```

## Pull request template

```md
Closes #

## What changed

## How to verify
1.

## Evidence

## Risk and rollback

## Checklist
- [ ] focused scope
- [ ] typecheck/lint/tests pass
- [ ] UI states handled
- [ ] migration + RLS included if data changed
- [ ] no secrets or sensitive demo data
```

## Daily operating rhythm

### Kickoff — 20 minutes

- Confirm P0 scope and demo narrative.
- Assign every P0 issue and identify dependencies.
- Agree on demo device, branch policy, environment owner, and integration times.
- Pair frontend/backend owners on data contracts before either side builds deeply.

### Build blocks — 90 minutes

- Each owner works one issue at a time.
- Post interface changes and blockers in the issue, not only in chat.
- Open a draft PR once the shape is visible.
- Use mocks against agreed TypeScript types while backend work lands.

### Integration — 15 minutes after each block

- Merge small green PRs.
- Re-run the primary path.
- Reassign blockers; cut scope before adding people to a tangled task.

### Demo freeze — final 2 hours

- No new features or dependencies.
- Reset and reseed the demo environment.
- Run the full script at least three times on the presentation network/device.
- Capture a backup screen recording and screenshots.
- Assign presenter, device operator, and recovery narrator.

## Codex workflow that conserves credits

1. Human creates/claims a scoped issue and pastes its number into the Codex task.
2. Ask Codex to inspect only the relevant area and return a compact plan.
3. Confirm any schema/API interface in the GitHub issue so other owners can mock it.
4. Ask Codex to implement and run targeted checks in the same task.
5. Human reviews the diff before asking for a second pass.
6. Ask for review only on named risks, such as overbooking or RLS—not a generic re-analysis.
7. Attach the PR result and decisions to the issue, then end that Codex task.

Good prompt:

```text
Implement issue #14: atomically accept a booking. Read AGENTS.md and
docs/architecture.md. Acceptance: only the ride owner can accept; accepted seats
never exceed capacity under concurrent calls; return remaining seats. Limit work
to one migration, DB tests, and generated types. Do not edit UI. Inspect first,
give a plan of at most five bullets, then implement and run targeted tests. Stop
and report if the existing schema conflicts with the proposed function.
```

Avoid:

```text
Build the backend and make it secure and production-ready.
```

## Conflict prevention

- One owner per shared hotspot: router/layout (B), design tokens (A), rides data contract (C + E), bookings contract (D + E), migrations (E).
- Announce planned migration filenames/table changes before editing.
- Do not let two PRs rename/move the same module concurrently.
- Merge contracts and shared primitives early; feature branches then build against them.
- If a PR exceeds about 400 changed lines, split generated/setup work from behavior when practical.

## Definition of ready for judging

- Fresh clone/setup instructions work.
- Secrets are configured from an example file, not committed.
- Seed command creates the two demo users/ride story or equivalent fixtures.
- Primary flow passes on two sessions.
- Offline/API-failure fallback is known.
- Every teammate can explain the scope cuts and architecture in one minute.

