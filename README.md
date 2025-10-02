# Maidaan - Sports Booking Platform

A modern sports booking platform built with Next.js 14, TypeScript, and Supabase.

## Features

- 🏟️ Venue booking system
- ⚽ Match organization and participation
- 👥 User profiles with role-based access
- 🎨 Dark mode support
- 📱 Responsive design
- 🔐 Supabase authentication
- 📊 Admin dashboard

## Tech Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth)
- **Forms:** React Hook Form with Zod validation
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase project created

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Maidaan
```

2. Install dependencies:
```bash
npm install
```

3. Configure Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy `.env.local` and add your Supabase configuration:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Welcome screen
│   ├── login/             # Login page
│   └── (app)/             # Protected routes
│       ├── dashboard/     # User dashboard
│       └── admin/         # Admin dashboard
├── components/
│   ├── ui/               # shadcn/ui components
│   └── layout/           # Layout components
├── lib/
│   ├── types.ts          # TypeScript interfaces
│   ├── supabase.ts       # Supabase configuration
│   └── utils.ts          # Utility functions
└── hooks/                # Custom React hooks
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## TypeScript Types

The project includes comprehensive TypeScript interfaces for:
- User Profiles
- Venues
- Matches/Bookings
- Reviews
- Payments

See `src/lib/types.ts` for details.

## License

MIT
