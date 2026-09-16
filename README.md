# LexRidesZA — mobile app (Expo / React Native)

A real native app: onboarding, login, signup, and the home dashboard,
matching the liquid-glass design from the original screens.

## Run it on your phone

1. Install [Node.js](https://nodejs.org) if you don't have it.
2. Install the **Expo Go** app on your phone (App Store / Play Store).
3. In this folder:

   ```bash
   npm install
   npx expo start
   ```

4. Scan the QR code that appears with:
   - **iPhone**: the Camera app
   - **Android**: the Expo Go app's built-in scanner

The app opens straight into Expo Go on your phone — no build step, no
Xcode/Android Studio needed for day-to-day work.

## Run it in a simulator (optional)

```bash
npx expo start --ios       # requires Xcode (Mac only)
npx expo start --android   # requires Android Studio + an emulator
```

## What's built

- **Onboarding** — sky gradient, frosted glass fleet panel, brand copy
- **Login** — glass auth card, validation, password show/hide
- **Signup** — glass auth card, full field set, terms checkbox, validation
- **Home** — greeting, search bar, 2-column action grid, bottom tab bar

`Bookings`, `Messages`, and `Profile` tabs are wired up in the navigator
as placeholders, ready for you to build out next.

## Project structure

```
App.js                      entry point, loads fonts, sets up navigation
app.json                    Expo config (name, bundle id, splash colour)
src/
  theme/                    colors, spacing, font names — single source of truth
  components/
    GradientBackground.js   sky gradient + soft liquid blobs
    GlassView.js            real frosted-glass surface (expo-blur)
    Buttons.js              primary / ghost buttons
    TextField.js            labeled input with icon + error state
    DashboardCard.js        pastel action card for the home grid
  screens/
    OnboardingScreen.js
    LoginScreen.js
    SignupScreen.js
    HomeScreen.js
    PlaceholderScreen.js    generic "coming soon" screen for stub tabs
  navigation/
    RootNavigator.js        Onboarding → Login/Signup → Main (stack)
    MainTabs.js              Home / Bookings / Messages / Profile (tabs)
```

## Swapping in a real backend

`LoginScreen` and `SignupScreen` currently validate locally and then
navigate straight into the app (`navigation.reset(...)` to `Main`).
Replace `handleLogin` / `handleSignup` with your actual auth calls
(e.g. a fetch to your ASP.NET Core API) and only navigate on success.

### Recommended backend

For this Expo app, Supabase is the quickest production-ready option: it
provides Postgres, email/phone authentication, vehicle photo storage, and
realtime booking/tracking updates in one service. Keep the Supabase anon key
in Expo public configuration and enforce access with Row Level Security.

Firebase is also suitable if realtime mobile sync is the priority. An
ASP.NET Core API with PostgreSQL is the better choice if the project already
needs custom business rules, payment webhooks, or an existing .NET team.
