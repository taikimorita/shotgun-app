# Client foundation

## Local setup

1. Copy `.env.example` to `.env`.
2. Add the Supabase project URL and publishable anon key.
3. Install dependencies with `npm install`.
4. Start Expo with `npm run start`.

The app validates both public environment values when the Supabase client initializes. The Supabase service-role key must never be placed in `.env` or the Expo bundle. Schema, RLS, and seed workflow are documented in `supabase/README.md` and `docs/auth.md`.

## Two-session demo workflow

Use two approved school-email accounts, each in a separate simulator/device or browser session. Sign in through the Supabase magic-link flow, then keep one session for the driver and one for the rider. This preserves production authorization boundaries; there is no local account switch that bypasses authentication.
