# Owner C task plan — rides frontend

Status: ready for issue creation and implementation planning

Owner: C — rides frontend

Working branch: `feat/owner-c-rides-frontend`

Commit identity: `Zach Goldwyn <zachgoldwyn@gmail.com>`

GitHub push identity: `zgoldwyn`

Product target: one polished mobile demo of creating and discovering a scheduled ride

## Outcome

Deliver the smallest reliable rides vertical slice: a verified driver can compose and publish a valid scheduled ride, and a rider can find that ride with useful filters and open its read-only details. The flow must remain deterministic with fixtures when maps or backend services are unavailable.

This plan is derived from `TASKS.md`, `docs/product.md`, `docs/architecture.md`, and `docs/team-workflow.md`. It does not authorize booking mutations, database migrations, auth work, or new dependencies.

## Non-negotiable branch steer

All Owner C work, including documentation, code, tests, screenshots, and integration fixes, belongs only on:

```text
feat/owner-c-rides-frontend
```

The orchestrator is the only agent allowed to create branches, stage files, commit, rebase/merge, or push. Spawned agents may inspect, edit their assigned files, and run checks, but must not run `git switch`, `git checkout`, `git add`, `git commit`, `git merge`, `git rebase`, or `git push`. Spawned agents must not spawn further agents.

Before every delegated task, commit, and push, the orchestrator must run:

```sh
test "$(git branch --show-current)" = "feat/owner-c-rides-frontend"
test "$(git config user.email)" = "zachgoldwyn@gmail.com"
test "$(git config user.name)" = "Zach Goldwyn"
git status --short --branch
```

If the branch assertion fails, stop. Do not repair it by moving or discarding work until the worktree and current branch have been inspected. Never commit directly to `main`, never push Owner C changes to another owner's branch, and never use a force push.

The repository-local Git identity must remain `Zach Goldwyn <zachgoldwyn@gmail.com>` for this branch. The orchestrator must not accept a subagent-authored commit. After each commit, verify both author and committer fields before pushing:

```sh
git show -s --format='author=%an <%ae>%ncommitter=%cn <%ce>' HEAD
```

If either email differs from `zachgoldwyn@gmail.com`, stop and correct the unpushed commit identity before continuing. Do not rewrite a commit that has already been shared without explicit user approval.

Before every push, the orchestrator must also verify that GitHub CLI authentication resolves to the user's account:

```sh
test "$(gh api user --jq .login)" = "zgoldwyn"
```

If authentication is missing, expired, or resolves to another username, do not push. Ask the user to authenticate `zgoldwyn`; never borrow another contributor's credentials. The `origin` repository may belong to another organization or account, but the pushing identity for Owner C must be `zgoldwyn`.

Push with the destination written explicitly:

```sh
git push -u origin HEAD:feat/owner-c-rides-frontend
```

Subagent handoffs must list changed files and checks run. The orchestrator reviews each diff, stages only that task's files, creates one coherent imperative commit, and pushes only after the task's focused checks pass. Unrelated user changes must remain unstaged.

Suggested commit sequence:

1. `Define rides frontend contracts and fixtures`
2. `Add mock maps adapter and place picker`
3. `Build validated ride creation flow`
4. `Build ride discovery and filters`
5. `Connect rides frontend to Supabase`
6. `Add resilient route preview`

## Owner C boundaries

### In scope

- Typed ride, place, route-summary, filter, and rides-service client contracts, agreed with Owners D and E.
- A single typed maps boundary with a deterministic mock.
- Place selection for origin, destination, and ordered optional stops.
- Ride create/edit form UI, client validation, submitting/error states, and published result.
- Discovery feed, filter UI, loading/empty/error states, and read-only ride facts.
- Replacing fixture reads/writes with the agreed typed Supabase-facing rides service.
- Read-only route preview with a static fallback.
- Focused unit/component tests and judge-facing screenshots for Owner C UI.

### Out of scope

- Auth/session restoration, navigation foundations, shared primitives, and design-token ownership (B/A).
- Booking request, accept, decline, cancel, status controls, and realtime booking behavior (D).
- Schema, migrations, RLS, RPCs, seed SQL, auth-provider setup, and generated database types (E).
- Direct Supabase or maps-provider calls from screens.
- Payments, live gas-price lookup, background location, OCR, chat, notifications, PostGIS corridor matching, or new global state.

### Ride-details ownership seam

`TASKS.md` assigns the fixture ride-details screen to D while `docs/team-workflow.md` lists ride detail under C. Use this split to avoid duplicate work:

- C owns the read-only ride data contract and presentation: route, time, stops, driver/vehicle summary, price label, capacity/remaining seats, notes, and preview.
- D owns booking state and actions embedded in or composed with that screen: request/accept/decline/cancel controls, participant-only details, realtime status, and booking errors.
- B owns the route registration/layout.

Before either screen implementation starts, C and D must agree on a narrow component or route-props seam. If that interface is not agreed, stop and record the conflict in the shared issue rather than building competing screens.

## Definition of done for Owner C

- A driver can complete the product-script ride: Cal Poly to SFO, tomorrow at 9:00 AM, three seats, one downtown stop, and a clearly labeled per-seat contribution.
- The published ride appears in discovery and the relevant date/destination/seat filters find it.
- Loading, empty, error, disabled/submitting, zero-results, slow-service, and maps-failure states are visible and usable where relevant.
- The fixture path works without network access; the live path uses only typed service modules.
- Ride screens do not freely write `seats_available`; remaining seats are treated as server-derived read data.
- No screen calls raw Supabase tables or a maps provider.
- Price uses integer cents, distance uses meters, stored times use UTC timestamps, and display uses an explicit agreed timezone.
- Icon-only controls have accessibility labels and form errors are readable text.
- Typecheck, lint, and focused tests pass on the agreed demo device/project setup.
- UI PR evidence includes screenshots of create, discovery, filters, and at least one failure/empty state.
- No secrets, debug logs, dead code, unrelated formatting, schema edits, or unapproved dependencies are included.

## Dependency gate

Do not invent missing cross-owner interfaces. The orchestrator records these in the Owner C tracking issue and obtains agreement before the dependent task begins.

| Needed from | Contract or artifact | Blocks |
| --- | --- | --- |
| Lead | Issue numbers, hackathon deadline, demo device, branch protection | all implementation |
| A | tokens, visual reference, demo copy/fixtures, final UI acceptance | C2–C6 polish |
| B | Expo scaffold, route groups, session/profile access, shared UI primitives, test commands | C2–C6 |
| D | ride-details composition seam and remaining-seat display needs | C1, C4, C5 |
| E | ride/stops schema contract, create/query service shape, generated types, seed identifiers, RLS behavior | C1, C5 |
| Team decision | timezone, maps provider availability, booking seat count, per-seat pricing | C1–C6 |

Accepted defaults in `docs/decisions.md` remain in force. If implementation needs a new service, dependency, table, secret, or product decision, stop and add a proposed entry to `docs/decisions.md` for human/team approval before proceeding.

## Execution order and delegation

Create one GitHub issue per task below, copying its outcome, acceptance criteria, boundaries, files/interfaces, and evidence. One delegated Codex task owns one issue. Tasks C1 and C2 may proceed in parallel only after C0; C3 and C4 may proceed in parallel only after their dependencies land. C5 follows the fixture UI and backend contract. C6 is last and is cut first if time is short.

No two active agents may edit the same file. Shared contract/index/router files are reserved for the orchestrator, unless one task is given exclusive ownership. Because agents share one worktree, the orchestrator must wait for an agent's handoff and review/stage its diff before assigning overlapping files.

### C0 — confirm contracts and integration seams

Priority/effort: P0 / S

Dependencies: Lead, B, D, E, unresolved team decisions

Purpose: make implementation ready without guessing at cross-owner behavior.

Work:

- Open/confirm the Owner C tracking issue and child issues C1–C6.
- Agree on the `Place`, `RouteSummary`, `Ride`, `RideDraft`, `RideFilters`, and rides/maps service shapes.
- Confirm whether a rider requests one or multiple seats, the display timezone, the per-seat price wording, and the mock-versus-real maps plan.
- Confirm the ride-details seam with D and route placement with B.
- Record approved new product/technical choices in `docs/decisions.md` only when required.

Acceptance criteria:

- [ ] Every contract has units and nullability documented; money is cents, distance is meters, timestamps are UTC.
- [ ] `remainingSeats` is read-only/derived and absent from create/update payloads.
- [ ] Maps and rides access are interfaces, not screen imports of vendors or Supabase.
- [ ] C/D ride-details responsibilities and B router ownership are written in the issue.
- [ ] Each implementation task has an issue number and exclusive file ownership.

Likely files/interfaces: issue descriptions; `docs/decisions.md` only if a decision is newly approved; future `src/features/rides/types.ts`, `src/lib/maps.ts`.

Evidence: links to agreed issue comments/contracts.

Stop condition: stop before coding if any contract changes database shape or another owner's API without that owner's acknowledgement.

### C1 — add rides contracts, fixture repository, and deterministic demo data

Priority/effort: P0 / S–M

Dependencies: C0; B's scaffold/test runner; A's demo copy; E's schema agreement

Work:

- Define the narrow client types and service interfaces agreed in C0.
- Add typed fixtures for Maya's fallback ride and enough contrasting rides to exercise filters and empty states.
- Implement an in-memory rides service supporting list/filter, get-by-id, create, and permitted driver edit behavior.
- Keep capacity and remaining availability distinct; the fixture service derives remaining seats from accepted fixture bookings or explicit server-shaped read data, never a client mutation.

Acceptance criteria:

- [ ] The Maya/Jordan demo data is fictional, stable, and contains no sensitive real-world data.
- [ ] Filtering behavior is deterministic for destination, date/time, maximum price, and required available seats.
- [ ] Create returns a scheduled ride with normalized units and makes it discoverable in the fixture session.
- [ ] Invalid draft data is rejected by validation before persistence.
- [ ] Focused tests cover filter boundaries, UTC/date conversion, integer cents, and derived availability behavior.

Likely files: `src/features/rides/types.ts`, `src/features/rides/service.ts`, `src/features/rides/fixtures.ts`, `src/features/rides/__tests__/service.test.ts`, and a validation/pricing module only if not supplied by B/E.

Evidence: focused test output and a short fixture inventory in the PR.

Stop condition: stop if the agreed E schema cannot represent the client contract or if a new state/query library appears necessary.

### C2 — build the typed mock maps adapter and place picker

Priority/effort: P0 / M

Dependencies: C0; B's shared inputs/screen primitives; A's tokens and common locations

Work:

- Implement the exact `MapsService` boundary from architecture with `searchPlaces` and `getRoute`.
- Add a deterministic mock covering Cal Poly, downtown San Luis Obispo, SFO, and the demo route.
- Build a reusable place picker for origin, destination, and ordered stops using that boundary.
- Provide idle, searching, no-results, error, selected, disabled, and retry/fallback behavior.

Acceptance criteria:

- [ ] No screen or picker imports provider-specific SDKs or endpoints.
- [ ] Search is deterministic and stale results cannot replace a newer query.
- [ ] A user can select and clear a place; selected data preserves display text and coordinates.
- [ ] The mock route returns distance meters, duration seconds, and optional preview geometry/static asset reference.
- [ ] Maps failure leaves text/place fixture selection usable for the demo.
- [ ] Tap targets, labels, keyboard behavior, and readable errors meet the UI guardrails.

Likely files: `src/lib/maps.ts`, `src/features/rides/mockMapsService.ts`, `src/features/rides/components/PlacePicker.tsx`, focused tests beside the feature.

Evidence: tests plus screenshots of selected, zero-results, and error states.

Stop condition: do not add a real maps SDK, key, environment value, or dependency without an approved decision.

### C3 — build and validate the create/edit ride flow

Priority/effort: P0 / M

Dependencies: C1, C2; B's authenticated layout/components; A's tokens/copy; vehicle/profile availability from B/E

Work:

- Build the driver form for origin, destination, departure, capacity, optional ordered stops, notes, and per-seat contribution.
- Show the deterministic suggested contribution and assumptions when route data is available; label suggested versus driver-set values honestly.
- Submit through the injected rides service and navigate/show a clear published result.
- Reuse the form for permitted driver edits only if the agreed service supports it without broadening scope.

Acceptance criteria:

- [ ] The scripted Cal Poly → SFO ride can be entered and published.
- [ ] Required fields, distinct origin/destination, future departure, positive capacity, nonnegative integer cents, stop ordering, and reasonable notes limits are validated.
- [ ] Invalid forms show readable field errors and cannot submit.
- [ ] Submission is single-flight with disabled/submitting feedback; failure preserves entered values and permits retry.
- [ ] Suggested-price assumptions and price source are visible; rounding is deterministic.
- [ ] Success produces a scheduled ride visible through the fixture repository.
- [ ] Loading/error behavior exists for required driver vehicle/profile state.

Likely files: Expo route file agreed with B; `src/features/rides/components/RideForm.tsx`; `src/features/rides/validation.ts`; `src/lib/pricing.ts`; focused form/logic tests.

Evidence: create-form and published-result screenshots; validation/pricing test output; manual demo steps.

Stop condition: stop if creation requires a schema/RLS change, if no verified driver/vehicle contract exists, or if form complexity would trigger an unapproved dependency.

### C4 — build discovery, filters, and read-only ride presentation

Priority/effort: P0 / M

Dependencies: C1; B navigation/components; A tokens/copy; C/D detail seam

Work:

- Build a mobile-first ride feed backed by the injected rides service.
- Add filters for origin/destination, date/time, maximum price, and required available seats.
- Build the C-owned read-only ride card/detail facts and compose them at the agreed D seam.
- Make the primary action and displayed seat count unambiguous without implementing booking behavior.

Acceptance criteria:

- [ ] Default discovery shows scheduled future rides in a documented stable order.
- [ ] The scripted tomorrow/SFO/two-seat filter finds Maya's ride.
- [ ] Applying, clearing, and revisiting filters behaves predictably.
- [ ] Feed has loading skeleton/progress, no-rides empty state, filtered zero-results state, error/retry state, and pull-to-refresh only if supported by B's pattern.
- [ ] Cards show route, local departure time/timezone, per-seat price/source, remaining seats, and verified trust signal from the agreed public profile shape.
- [ ] Full/cancelled/past rides cannot be presented as requestable.
- [ ] Ride detail contains no D-owned booking mutation or participant-only contact/plate exposure.

Likely files: Expo route files agreed with B/D; `src/features/rides/components/RideCard.tsx`, `RideFacts.tsx`, `RideFilters.tsx`; list/filter hooks or controller; focused tests.

Evidence: feed, active filters, zero-results, and error screenshots; filter tests; manual navigation check.

Stop condition: stop if route ownership with B/D is unresolved or if private participant data is required by the proposed display.

### C5 — connect create and discovery to the live rides service

Priority/effort: P0 / M

Dependencies: C3, C4; E migrations/RLS/seed/generated types; authenticated user from B

Work:

- Implement the live rides-service adapter against E's agreed API/query boundary.
- Map database/server shapes to the stable client types in one module.
- Wire dependency selection so fixtures remain an explicit, deterministic demo fallback.
- Persist/retrieve route summary, ordered stops, pricing assumptions, and price source as supported by the approved schema.

Acceptance criteria:

- [ ] Screens remain unaware of Supabase tables and use the same service interface as fixtures.
- [ ] Authenticated drivers can create only their own valid rides through the authorized backend path.
- [ ] Discovery returns only data allowed by E's RLS/view contract and maps units/nulls correctly.
- [ ] Newly created rides appear after the documented refresh/invalidation behavior.
- [ ] Backend, slow-network, empty, and retry states are handled without losing a create draft.
- [ ] Fixture mode can be deliberately selected for the demo and is visibly distinguishable in developer configuration, not falsely described as live.
- [ ] Integration verification includes both an allowed path and an expected authorization failure supplied/reviewed by E.

Likely files: `src/features/rides/supabaseRidesService.ts`, service composition/configuration file owned with B, existing C screens/hooks, focused adapter/integration tests. No migrations.

Evidence: integration logs, create/discovery screenshots, and documented fixture fallback steps.

Stop condition: stop rather than bypassing RLS, using a service-role key, querying raw tables from screens, or editing E-owned migrations.

### C6 — add resilient route preview and final Owner C polish

Priority/effort: P0 / S; first Owner C cut when behind

Dependencies: C3–C5; approved maps approach; A final UI review

Work:

- Render a read-only route preview from the maps boundary on create confirmation/cards/details where it materially helps.
- Preserve a static route image, simple route-line asset, or polished placeholder when the provider/network fails.
- Run a consistency and accessibility pass over Owner C screens without reformatting unrelated code.

Acceptance criteria:

- [ ] Preview failure never blocks ride creation, discovery, or detail navigation.
- [ ] Fallback has useful route text and no broken-map chrome.
- [ ] Loading/error transitions do not cause disruptive layout shifts on the agreed device.
- [ ] All Owner C screens use shared tokens/primitives, large tap targets, one clear primary action, and labeled icon-only controls.
- [ ] The complete Owner C fixture path is rehearsed three consecutive times on the agreed device.
- [ ] Final typecheck, lint, focused tests, and the Owner C portion of the smoke script pass.

Likely files: a C-owned `RoutePreview.tsx`, existing C screens/components/tests, and demo evidence only.

Evidence: live/available preview and fallback screenshots; three-run smoke note; check output.

Stop condition: if provider setup is not already approved and available, ship the static/fixture fallback and do not add the provider.

## Orchestrator task prompt template

Use this for each future subagent, filling in the issue and exclusive paths:

```text
Implement Owner C issue #<number>: <task title> on the shared working tree.
Read AGENTS.md, docs/product.md, docs/architecture.md, and
docs/owner-c-rides-frontend-tasks.md. Work only within task <C#> and these
exclusive files: <paths>. Do not spawn agents. Do not run any Git branch,
stage, commit, merge, rebase, or push command; the orchestrator owns Git.
Inspect existing code/tests first, restate the task acceptance criteria, and
give a plan of five bullets or fewer before editing. Use existing contracts and
dependencies. Run the focused checks named in the task. Stop and report if a
new dependency/service/table/secret/product decision is needed, another owner's
interface conflicts, or assigned files contain unrelated work. Finish with the
changed-file list, checks/results, remaining risks, and evidence needed.
```

## Final Owner C PR checklist

- [ ] Current branch is exactly `feat/owner-c-rides-frontend`.
- [ ] Repository Git identity and every new commit's author/committer email are `Zach Goldwyn <zachgoldwyn@gmail.com>`.
- [ ] Authenticated GitHub push identity is `zgoldwyn`.
- [ ] PR references all included Owner C issues and no unrelated stream.
- [ ] Diff is reviewable; if it approaches 400 non-generated changed lines, commits/tasks are independently reviewable and the PR split is discussed.
- [ ] Owner A approved UI/demo behavior.
- [ ] Owners D and E approved their shared interfaces; E reviewed any auth/RLS-facing behavior.
- [ ] Typecheck, lint, focused tests, and manual smoke steps pass.
- [ ] Screenshots cover create, discovery, filters, and fallback/error behavior.
- [ ] Fixture fallback is documented and uses fictional data.
- [ ] No secrets, debug logs, dead code, migrations, booking mutations, or unrelated formatting are present.
- [ ] Push target is explicitly `origin HEAD:feat/owner-c-rides-frontend`; force push is not used.
