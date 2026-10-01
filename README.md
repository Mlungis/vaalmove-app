# LexRidesZA

LexRidesZA is an Expo / React Native vehicle-rental app backed by Supabase.
Supabase provides authentication, Postgres data and row-level security, realtime
updates, and image storage. Paystack checkout is handled by authenticated
Supabase Edge Functions; secret payment credentials stay on the server.

## Run the app

1. Install Node.js and the Expo Go app.
2. Copy `.env.example` to `.env.local` and set the Supabase project URL and
   publishable key. Optionally set `EXPO_PUBLIC_SUPPORT_PHONE` and
   `EXPO_PUBLIC_SUPPORT_EMAIL` to enable the matching support contact buttons.
3. Install dependencies and start Expo:

   ```bash
   npm install
   npx expo start
   ```

4. Scan the QR code with Expo Go, or run `npx expo start --web`.

Never put a Supabase service-role key or Paystack secret key in an Expo
`EXPO_PUBLIC_*` variable. `.env.local` is ignored by Git.

## Configure the Supabase backend

1. Create a Supabase project. In **Project Settings → API**, copy the project
   URL and publishable key into `.env.local`:

   ```dotenv
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

2. In the Supabase SQL Editor, run `supabase/schema.sql` for a new database.
   For an existing app database, run the SQL migration files in
   `supabase/migrations/` in filename order, or authenticate and run
   `npx supabase db push`. The schema enables row-level
   security, creates the required tables and storage buckets, calculates
   booking prices in the database, and creates booking conversations and
   notifications. Signup saves the user's name and phone to their profile.

3. Install the Supabase CLI, authenticate, and link this folder to the project:

   ```bash
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   ```

4. Add your Paystack **secret test key** as an Edge Function secret and deploy
   the server functions:

   ```bash
   supabase secrets set PAYSTACK_SECRET_KEY=sk_test_your_key
   supabase functions deploy paystack-transaction
   supabase functions deploy paystack-webhook --no-verify-jwt
   supabase functions deploy delete-account
   ```

   Supabase provides the function runtime values
   `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
   Do not manually expose or bundle `SUPABASE_SERVICE_ROLE_KEY`.

5. In the Paystack dashboard, configure the webhook URL:

   ```text
   https://YOUR_PROJECT_REF.supabase.co/functions/v1/paystack-webhook
   ```

   The webhook verifies Paystack's HMAC signature and then independently
   verifies the transaction amount, currency, reference, and booking metadata
   before marking a booking paid. The authenticated payment function performs
   the same checks when the customer returns from checkout.

6. In Supabase **Authentication → URL Configuration**, allow the app callback
   URLs for your builds, including:

   ```text
   lexridesza://auth/callback
   lexridesza://payment/callback
   ```

   Enable email/password sign-in. To use Google, Apple, or Facebook, enable
   each provider in Supabase and add its provider credentials and redirect URI.

## Backend functionality

- Email/password signup, login, password reset, OAuth session handling, and
  account deletion.
- Profile and preference persistence, saved locations, favorites, and job
  posts.
- Published vehicle listings, provider-owned images, features, and availability.
- Server-priced rental bookings with overlap protection and provider/renter
  authorization.
- Paystack initialization, signed webhooks, server-side transaction
  verification, and payment-confirmed bookings.
- Booking-linked conversations, message read states, booking notifications,
  and realtime refreshes.

## Payment and booking smoke test

Use Paystack test credentials until the complete checkout flow has been
verified. Create two accounts, publish a vehicle from one, and book it from the
other. Confirm that:

- the database-generated booking total is based on the vehicle price and rental
  dates, not a client-submitted amount;
- an overlapping booking is rejected;
- a successful Paystack test transaction changes the booking to `confirmed`
  and `paid`;
- a failed or cancelled transaction does not mark the booking as paid; and
- each booking creates a conversation between its renter and provider.

Deploying this code does not create a Supabase project or configure external
credentials. Those steps must be completed in your own Supabase and Paystack
accounts before the live backend can accept users or payments.
