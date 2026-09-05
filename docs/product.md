# Product scope

## Problem

Students currently coordinate rides through free-form social posts. The information is inconsistent, hard to filter, seat availability goes stale, and identity/accountability are weak.

## Target user

For the hackathon, the target is a Cal Poly student coordinating planned, shared rides around San Luis Obispo and common regional destinations. This is coordination and cost-sharing, not an on-demand commercial rideshare marketplace.

## Core promise

Find a relevant ride and request a seat in under one minute, with enough verified context to make an informed decision.

## P0: demo-critical

- School-email sign-in and verified badge
- Basic rider/driver profile and vehicle details
- Create a scheduled ride: origin, destination, departure time, seat capacity, optional stops, notes, and price
- Suggested contribution from route distance and configurable cost assumptions
- Ride feed with filters for location, date/time, price, and available seats
- Ride details and request/accept/decline/cancel flow
- Real-time remaining-seat and booking-status updates
- Ride lifecycle: scheduled, in progress, completed, cancelled
- Post-ride rating and report entry point
- Seeded common campus locations and demo data

## P1: add only after the demo loop is stable

- Route-aware “passes near me” matching
- Gas-receipt image upload and manual confirmation
- Push notifications and departure reminders
- In-app participant messaging secured by RLS
- Luggage and comfort-preference filters
- Share ride details with a trusted contact
- Block user and minimal admin review view
- Driver-set price override with an “estimated/driver set” label

## Explicitly out of scope for the hackathon

- Payments, platform fees, payouts, refunds, or stored cards
- True end-to-end encrypted chat
- Live driver tracking or background GPS
- Automated Poly ID, driver-license, insurance, or receipt OCR
- Automated identity decisions from an uploaded document
- Dynamic live gas-price integrations
- Full moderation/admin product
- Multi-campus tenancy, web parity, or production app-store release
- Complex rewards economy; display average rating and completed-ride count instead

## Primary user stories

### Driver posts a ride

Given a verified user with a vehicle, when they enter route, time, capacity, and price information, a scheduled ride appears in discovery and shows the correct open-seat count.

### Rider requests a seat

Given a verified rider, when they filter and open a scheduled ride with availability, they can request one seat and see a pending state. They cannot duplicate the request.

### Driver accepts safely

Given a pending request, when the ride owner accepts it, the booking becomes accepted and remaining seats decrease atomically. Acceptance fails cleanly if the ride has filled.

### Participants complete and rate

Given an accepted booking, the driver can progress the ride to completed. Each participant can then leave one rating and optionally submit a private report.

## Demo script

Use two seeded accounts on two devices or one device plus simulator.

1. Show the verified profile and trust indicators.
2. As Maya (driver), post “Cal Poly → SFO,” tomorrow at 9:00 AM, three seats, one downtown pickup stop.
3. Show the suggested contribution, then publish.
4. As Jordan (rider), filter tomorrow/SFO/two seats and open Maya's ride.
5. Request a seat; switch to Maya and accept.
6. Show both clients updating and the seat count changing without refresh.
7. Mark the ride complete and show the rating/report experience.

Keep a pre-seeded ride available as a fallback if live creation fails.

## UX direction

- Warm, trustworthy, distinctly student-oriented—not a clone of Uber.
- Home opens on ride discovery with a prominent “Call shotgun” action.
- Use a restrained palette, route line/accent color, rounded cards, and excellent typography.
- Use familiar local place names and realistic profile/vehicle data.
- Prefer a static route preview or graceful placeholder over a broken map.

## Success criteria

- The scripted flow completes in under three minutes.
- No dead-end screen or manual database edit is needed during the demo.
- Two clients converge on booking status and seat count within a few seconds.
- The app clearly communicates verified status, estimated cost, and ride status.
- The team can explain what is real, what is mocked, and what would be productionized next.

