# Booking frontend

Fixture-backed Expo Router booking screens for the Milestone 1 D deliverable.

## Run

Install the dependencies with `npm install`, then use `npm start`. After sign-in, the default screen is **Your rides**. It links to the passenger-request screen and the sample ride details screen.

## Demo paths

- `/rides/ride-slo-sf` — rider-facing details, including request and status feedback.
- `/rides/ride-slo-la` — driver-facing details.
- `/rides/ride-slo-sb` — a requestable fixture ride for the rider flow.
- `/requests` — driver request queue; Accept and Decline update the mock service.
- `/upcoming` — rider’s accepted and pending ride list.

The routes live in the authenticated `(app)` route group, so a restored Supabase session is required. `src/services/mockBookingService.ts` is the sole booking-state boundary. Replace its methods with the Supabase booking calls in Milestone 2 without changing the screen APIs.
