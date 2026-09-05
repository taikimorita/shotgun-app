# Decisions and open questions

Keep entries short. A decision is useful only if it prevents the team from reopening the same debate.

## Questions to answer before implementation

1. How long is the hackathon, and which iOS/Android device will be used for judging?
2. Is the first campus Cal Poly SLO, and what exact student email domain(s) are valid?
3. Does anyone have permission to register an app in the school's Microsoft Entra tenant? If not, approve school-domain magic-link auth for the demo.
4. Is “upload Poly ID” a judging requirement, or is verified school email sufficient? The recommendation is not to collect ID images in the MVP.
5. Is a maps API key/credit already available, and for which provider?
6. Is the driver offering seats in their own car? The current model assumes yes; “rider determines available seats” appears to mean the ride creator/driver.
7. Should a booking always represent one seat for MVP, or may one rider request multiple seats?
8. Are prices per seat or total trip contribution? The recommendation is per-seat integer cents.
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

