# Shotgun

Shotgun is a student rideshare app for finding and filling trusted, scheduled rides. Verified students can post a ride, discover rides that pass through their destination, request a seat, and manage the request from one mobile-first flow.

## Demo highlights

- School-email sign-in and verified student profiles
- Geoapify-powered location autocomplete through a secure Supabase Edge Function
- Pickup-aware discovery that matches both intermediate stops and final destinations
- Interactive maps with available ride stops, routed paths, and estimated arrival times
- Multiple ordered stops per ride
- Rider request and driver accept/decline flow with updated seat availability
- Deterministic demo rides if an external maps request is unavailable

For a useful search demo, choose **Cal Poly, San Luis Obispo** as the pickup and **Santa Barbara Airport** as the destination. Shotgun returns the available Los Angeles and San Diego rides that stop at the airport.

## Run on iOS

Requirements:

- macOS with Xcode and an iOS Simulator installed
- Node.js and npm
- The project's publishable Supabase URL and anonymous key

Install and configure:

```bash
npm install
cp .env.example .env
```

Fill in `.env` with the publishable client values supplied by the team:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-publishable-anon-key
```

Then launch the app:

```bash
npm run ios
```

Expo starts Metro, opens the configured iPhone Simulator, and loads Shotgun. On the login screen, use **Continue as Maya (demo)** for the judge-facing flow.

> `EXPO_PUBLIC_*` values are public client configuration. Never place the Supabase service-role key or Geoapify key in the Expo environment. Geoapify is already accessed through the deployed Supabase function.

## Suggested judge flow

1. Continue as Maya on the login screen.
2. On Find, select Santa Barbara Airport and view the two rides serving that stop.
3. Open the Los Angeles ride to see its route through Morro Bay and SBA, including stop ETAs and driver details.
4. Request a seat.
5. Open Requests/My Rides to demonstrate the driver decision and seat-status experience.
6. Post a ride with multiple stops to show live autocomplete, routing, and contribution estimation.

## Useful commands

```bash
npm run ios       # Start Expo and open the iOS Simulator
npm run android   # Start Expo and open Android
npm run web       # Start the web fallback
npm run typecheck # Run the TypeScript check
```

Backend setup, local Supabase commands, seeded accounts, and RLS testing are documented in [supabase/README.md](supabase/README.md). Product scope and architecture are in [docs/product.md](docs/product.md) and [docs/architecture.md](docs/architecture.md).

## Screenshots

- [Stop-aware ride search](docs/find-stop-aware-search.png)
- [Ride route with estimated arrivals](docs/ride-details-arrival-times.png)
- [Ride request flow](docs/requests-redesign.png)
- [Animated login artwork](docs/login-cover-gif.png)
