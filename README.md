# MockTrack

UPSC & competitive exam mock test tracker — React Native app with Supabase cloud sync.

## Features
- Multi-user auth (email/password, forgot password)
- Real-time sync across devices via Supabase Realtime
- Track mocks & previous year papers: score, percentile, time, attempts, notes
- 22 exams across 8 categories (UPSC, SSC, Banking, Railways, etc.)
- Per-exam subject lists with full customization
- Analytics: score trends, subject averages, percentile stats
- In-app version check with force-update support

## Tech Stack
- React Native + Expo (SDK 51)
- Supabase (Auth + Postgres + Realtime)
- TypeScript

## Setup

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/mocktrack.git
cd mocktrack
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
```
Edit `.env` and fill in your Supabase URL and anon key.

### 4. Set up Supabase
- Run `supabase/schema.sql` in your Supabase SQL Editor
- If upgrading, also run `supabase/migration_v2.sql`

### 5. Run the app
```bash
npx expo start
```

## Building an APK
```bash
npx expo prebuild --platform android --clean
# Then open android/ in Android Studio → Build → Build APK(s)
```

## Version control workflow
See CONTRIBUTING.md for branching strategy.

## Environment variables
See `.env.example` for required variables.
