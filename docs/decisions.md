# Decisions and open questions

Keep entries short. A decision is useful only if it prevents the team from reopening the same debate.

## Questions to answer before implementation

1. Resolved in D-010: the deadline is September 6, 2026, and the primary demo device is an iPhone 17 Pro.
2. Is the first campus Cal Poly SLO, and what exact student email domain(s) are valid?
3. Does anyone have permission to register an app in the school's Microsoft Entra tenant? If not, approve school-domain magic-link auth for the demo.
4. Is “upload Poly ID” a judging requirement, or is verified school email sufficient? The recommendation is not to collect ID images in the MVP.
5. Resolved in D-013 and D-014: use Geoapify for live place search, directions, and map preview; Owner E owns server-side secret handling and Owner C keeps the typed fallback boundary.
6. Is the driver offering seats in their own car? The current model assumes yes; “rider determines available seats” appears to mean the ride creator/driver.
7. Resolved in D-011: one booking request represents exactly one seat for MVP.
8. Resolved in D-011: prices are per-seat contributions represented as integer cents and displayed as dollars and cents.
9. Should comfort preferences such as women-only be in the demo? If yes, define eligibility, enforcement, and inclusive wording before implementation.

## Accepted defaults until changed

### D-001 — One app, one backend

Use an Expo/React Native TypeScript app with Supabase. No separate custom backend for MVP.

### D-002 — Coordination, not commerce

Shotgun coordinates planned cost-sharing rides. It does not process payments or take a cut in the hackathon version.

### D-003 — Verification means school-email verification

Use Microsoft/Azure OAuth if tenant configuration is available; otherwise use a school-domain email link. Do not claim government-identity verification.

### D-004 — No Poly ID retention in MVP

Store verification state, not raw student ID images. A clickable upload mock may be used only if clearly labeled in the demo.

### D-005 — Driver approval required

Ride requests remain pending until the driver accepts or declines. There is no instant booking.

### D-006 — Atomic availability

Seat availability is derived from accepted bookings and acceptance occurs in one database transaction/function.

### D-007 — Transparent estimated pricing

Use cached route distance plus configurable MPG/fuel/tolls assumptions. Drivers can override; UI labels the source. No live gas-price dependency for P0.

### D-008 — No true E2EE claim

Participant messages, if built, use authenticated access and RLS. E2EE is deferred and the product copy must not imply it exists.

### D-009 — One polished mobile target

Build and test for the agreed judging device first. Cross-platform parity follows only if P0 is stable.

### D-010 — Demo device and deadline

Date: 2026-09-05
Owner: team lead
Status: accepted

Decision: Optimize and verify the demo on an iPhone 17 Pro. The hackathon deadline is September 6, 2026.
Reason: The team confirmed the judging target and delivery date.
Consequences: UI evidence and the three-run smoke test use this device target first. Scope cuts happen before adding cross-platform polish.

### D-011 — One-seat requests and per-seat pricing

Date: 2026-09-05
Owner: team lead
Status: accepted

Decision: Each booking request is for exactly one seat. A driver sets the ride's total seat capacity. Ride prices are per-seat contributions stored as integer cents and displayed as dollars and cents.
Reason: This keeps booking and pricing behavior unambiguous for the MVP demo.
Consequences: Booking inputs do not request a seat quantity. Clients never write remaining-seat counts; accepted bookings determine availability atomically.

### D-012 — Los Angeles display timezone

Date: 2026-09-05
Owner: team lead
Status: accepted

Decision: Persist ride times as UTC timestamps and display demo ride times in the `America/Los_Angeles` IANA timezone.
Reason: The Cal Poly demo is based in California and needs deterministic date/time filtering and display.
Consequences: Forms convert local input to UTC at their boundary, and filters/tests include daylight-saving behavior through the IANA timezone rather than a fixed offset.

### D-013 — Live maps without live driver tracking

Date: 2026-09-05
Owner: team lead
Status: accepted

Decision: Use a live maps provider for place search, directions, and an interactive route preview. Continuous driver tracking and background location remain out of scope. Keep the deterministic fixture/static fallback required by the demo plan.
Reason: The team wants a real map experience while preserving the smallest reliable hackathon flow.
Consequences: Owner C must use the typed `MapsService` boundary. Provider choice, key ownership, quota, client-versus-server key restrictions, and approved dependency must be resolved before live-map implementation.

### D-014 — Geoapify for MVP maps

Date: 2026-09-05
Owner: team lead
Status: accepted

Decision: Use Geoapify for MVP place search, directions, and route preview. Keep the Geoapify secret in Supabase secrets or server-side runtime controlled by Owner E; never expose it through `EXPO_PUBLIC_*` values or the client bundle. Owner C consumes the provider only through the typed, provider-neutral `MapsService` boundary and keeps the deterministic mock/static fallback. Continuous, live-driver tracking remains out of scope.
Reason: Geoapify satisfies the live-map requirement while keeping secrets off-device and preserving a deterministic demo fallback.
Consequences: Owner E owns backend or Edge Function integration plus secret wiring. Owner C must not import Geoapify SDKs or endpoints directly and should depend only on `MapsService`, `Place`, and `RouteSummary`.

### D-015 — Interactive Find map and foreground location

Date: 2026-09-06
Owner: team lead
Status: accepted

Decision: Render the interactive Find map with `react-native-maps` using Apple Maps on the iPhone demo target. Geoapify remains the server-side provider for place search and routing. Use `expo-location` only after an explicit “Use my location” action and request foreground access only; never collect or track location in the background.
Reason: The judge-facing Find flow now needs a tappable map containing the selected pickup and discoverable ride destinations. Native Apple Maps provides interaction without putting the Geoapify secret in the Expo bundle.
Consequences: The map consumes only cached ride coordinates and typed location output. A searched pickup works without location permission, denial is non-blocking, and web/unsupported rendering keeps a useful static preview.

## Decision entry template

```md
### D-0XX — Title

Date:
Owner:
Status: proposed | accepted | superseded

Decision:
Reason:
Consequences:
```
