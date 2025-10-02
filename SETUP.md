# Maidaan Platform - Setup Guide

## Project Overview

Maidaan is a comprehensive sports venue booking and match management platform with separate portals for Players and Admins.

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS v4
- **UI Components**: shadcn/ui
- **State Management**: Zustand (sliced stores)
- **Backend**: Supabase (PostgreSQL + Auth)
- **Form Validation**: React Hook Form + Zod

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- Git

## Installation Steps

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd Maidaan
npm install
```

### 2. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. In your Supabase dashboard, go to **SQL Editor**

3. Copy and paste the entire contents of `supabase-schema.sql` and run it

4. Go to **Settings > API** and copy:
   - Project URL
   - Anon/Public Key

5. Create `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Enable Supabase Auth

1. In Supabase dashboard, go to **Authentication > Providers**
2. Enable **Phone** provider
3. Configure your phone auth settings (Twilio or native)

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (app)/                    # Authenticated routes
│   │   ├── layout.tsx            # Role-based layout
│   │   ├── dashboard/            # Player routes
│   │   ├── matches/              # Player matches
│   │   ├── profile/              # Player profile
│   │   └── admin/                # Admin routes
│   ├── login/                    # Auth pages
│   └── page.tsx                  # Welcome/role selection
│
├── components/                   # Shared components
│   ├── layout/                   # Layout components
│   ├── booking/                  # Booking-related
│   ├── matches/                  # Match components
│   ├── profile/                  # Profile components
│   └── ui/                       # shadcn components
│
├── lib/
│   ├── data.ts                   # Type definitions
│   ├── time.ts                   # Time utilities
│   ├── utils.ts                  # General utilities
│   ├── supabase.ts               # Supabase client
│   └── stores/                   # Zustand stores
│       ├── profile.ts            # User profile state
│       ├── venue.ts              # Venue state
│       └── ui.ts                 # UI state
│
└── hooks/                        # Custom hooks
    └── use-booking-slots.ts      # Booking logic
```

## Key Features Implemented

### ✅ Core Infrastructure
- Type-safe data models
- Sliced Zustand state management
- Supabase integration with RLS
- Phone-based authentication

### ✅ Admin Features
- Dashboard with live booking view
- Real-time slot availability
- Court management
- Date navigation
- Stats tracking (bookings/revenue)

### ✅ Shared Components
- TimeSlots grid (3-column: Morning/Afternoon/Evening)
- VenueHeader, PageHeader
- StatsCards, DailySummaryCard
- DateSelector, CourtSelector
- BottomNav, PageLayout

### ✅ Utilities
- Dynamic time slot generation
- Pricing calculation (time period + weekday/weekend)
- Time formatting (12-hour display)
- Slot categorization

## Next Development Steps

1. **Player Dashboard** - Browse venues, view matches
2. **Booking Flow** - Complete booking with payment
3. **Match Management** - Join matches, QR sharing
4. **Profile System** - Edit profile, friends list
5. **Social Features** - Friends, match sharing, QR codes
6. **Payment Integration** - Cash/QR payment tracking
7. **Recurring Bookings** - Weekly/monthly bookings
8. **Cancellation Policy** - Time-based cancellation

## Database Schema

See `supabase-schema.sql` for complete schema with:
- Profiles (players/admins)
- Venues (with courts and pricing)
- Matches (with players list and payment)
- Row Level Security policies

## Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=          # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Your Supabase anon key

# Optional (for production)
SUPABASE_SERVICE_ROLE_KEY=         # For server-side operations
NEXT_PUBLIC_SITE_URL=              # Your production URL
```

## Development Workflow

### Running the App
```bash
npm run dev       # Development server
npm run build     # Production build
npm run start     # Production server
npm run lint      # ESLint
```

### Code Structure Principles

1. **DRY** - Use custom hooks for repeated logic
2. **Single Source of Truth** - Calculate stats in server actions
3. **Role-Based UI** - Conditional rendering in shared components
4. **Feature-Based Organization** - Group by feature, not type
5. **Co-location** - Page-specific components in `page/components`

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Supabase Connection Issues
- Verify `.env.local` variables
- Check Supabase project is active
- Ensure RLS policies are set up correctly

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

## Contributing

1. Create feature branch from `main`
2. Follow existing code structure
3. Use TypeScript strictly
4. Test thoroughly before PR

## License

MIT

## Support

For issues, contact: [your-email@example.com]
