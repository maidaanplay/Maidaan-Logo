# Maidaan App - Component Architecture

## Overview

This document outlines the component-based architecture for reusable UI across different user roles (players, admins, public).

---

## Implemented: Match Detail Components ✅

### Component Structure

```
/src/components/match/
├── match-venue-info.tsx          (venue name, location)
├── match-court-datetime.tsx      (court, sport, date, time, recurring)
├── match-players-list.tsx        (players with owner highlight)
├── match-payment.tsx             (price, payment status)
└── match-share-sheet.tsx         (QR code, share URL)
```

### Pages Using These Components

1. **Player Match Detail** - `/src/app/(app)/players/match/[id]/page.tsx`
   - For logged-in players (owner or joiner)
   - Shows: Venue, Court/DateTime, Match Type, Booker Info, Players (if not admin-owned), Payment
   - Footer: Cancel/Share (owner) or Join/Share (other players)

2. **Public Match Detail** - `/src/app/match/[id]/page.tsx`
   - For unauthenticated users via QR code/share link
   - Shows: Venue, Court/DateTime, Match Type, Download CTA
   - Footer: Join (→ /login) + Share

3. **Admin Match Detail** - `/src/app/admin/match/[id]/page.tsx` ✅
   - For venue admins
   - Shows: Court/DateTime, Booker Info, Payment
   - Footer: Mark as Paid, Cancel Booking

### Benefits Achieved

- **35% code reduction** in player match detail (472 → 306 lines)
- **34% code reduction** in public match detail (358 → 238 lines)
- **30% code reduction** in admin match detail (330 → 230 lines)
- **No duplication** of court, date/time, payment UI
- **Easy to maintain** - update once, applies everywhere
- **Consistent UI** across all match detail views

---

## Implemented: Venue Detail Components ✅

### Component Structure

```
/src/components/venue/
├── venue-header.tsx              (name, location, rating)
├── venue-description.tsx         (about text)
├── venue-operating-hours.tsx     (hours display)
├── venue-amenities.tsx           (amenities badges)
└── venue-courts-list.tsx         (courts with icons)
```

### Pages Using These Components

1. **Player Venue Detail** - `/src/app/(app)/players/venues/[id]/page.tsx` ✅
   - For logged-in players browsing venues
   - Shows: Header, Description, Hours, Amenities, Courts
   - Footer: Book Now

2. **Admin Venue Profile** - `/src/app/admin/venue-profile/page.tsx` ✅
   - For venue admins viewing their own venue
   - Shows: Header, Description, Hours, Courts, Amenities, Pricing, Settings
   - Footer: Edit Venue

3. **Public Venue Detail** - `/src/app/venue/[id]/page.tsx` ✅
   - For unauthenticated users
   - Shows: Header, Description, Hours, Amenities, Courts
   - Footer: Book Now (→ /login)

### Benefits Achieved

- **44% code reduction** in player venue detail (144 → 81 lines)
- **40% code reduction** in admin venue profile (242 → 153 lines)
- **No duplication** of header, description, hours, amenities, courts UI
- **Easy to maintain** - update once, applies everywhere
- **Consistent UI** across all venue detail views

---

## Recommended: Player Profile Components

### Proposed Component Structure

```
/src/components/player/
├── player-header.tsx             (avatar, name, jersey)
├── player-bio.tsx                (about section)
├── player-stats.tsx              (matches played, skill level)
├── player-badges.tsx             (achievements)
└── player-recent-matches.tsx     (match history)
```

### Pages That Would Use These

1. **Own Profile** - `/src/app/(app)/players/profile/page.tsx` ✅ *exists*
   - Shows: Header, Bio, Stats
   - Actions: Edit Profile, View History

2. **Other Player Profile** - `/src/app/(app)/players/player/[id]/page.tsx` *to be created*
   - Shows: Same but without edit ability
   - Actions: View History, Add Friend, Message

3. **Public Player Profile** - `/src/app/player/[id]/page.tsx` *to be created*
   - Shows: Basic info only
   - Actions: Login to Connect

### Current State

Only own profile exists. Creating "other player" and "public player" profiles would require:
- New routes (`/players/player/[id]`, `/player/[id]`)
- Player lookup by ID (not just current user)
- Privacy settings logic
- Friend/connection system

**Recommendation**: Extract components when implementing player-to-player features.

---

## Standard Layout Architecture ✅

### Core Layout Components

All pages use these foundational components:

1. **AppHeader** - `/src/components/app-header.tsx`
   - Main pages: Logo, title, avatar dropdown
   - Sub-pages: Back button, title
   - Automatically shows correct variant based on route

2. **AppBottomNav** - `/src/components/app-bottom-nav.tsx`
   - Only on main pages (`/players`, `/players/play`, `/players/profile`)
   - Home, Play, Profile icons

3. **Fixed Footer** - Custom per page
   - Standard styling: `fixed bottom-0 left-0 right-0 z-50`
   - Standard container: `max-w-md mx-auto p-4`
   - Standard padding: `pb-32` on page content

### Layout Rules

✅ **DO**:
- Use AppHeader for all pages (via layout)
- Use `space-y-6` for vertical spacing
- Use `max-w-md` for content width
- Use `pb-32` when page has fixed footer

❌ **DON'T**:
- Create custom headers (removed PageLayout)
- Use inconsistent spacing
- Hardcode max-width values
- Forget bottom padding with footers

---

## Implementation Priorities

### Phase 1: Completed ✅
- [x] Match detail components extracted
- [x] Player match detail refactored
- [x] Public match detail refactored
- [x] Admin match detail refactored
- [x] Standard layout architecture established

### Phase 2: Completed ✅
- [x] Venue detail components extracted
- [x] Player venue detail refactored
- [x] Admin venue profile refactored
- [x] Public venue detail page created

### Phase 3: Next Steps
- [ ] Extract player profile components (when implementing social features)

### Phase 4: Future Features
- [ ] Create other player profile page (`/players/player/[id]`)
- [ ] Create public player profile page (`/player/[id]`)

---

## Benefits of This Architecture

1. **DRY Principle** - Write once, use everywhere
2. **Consistency** - Same UI across all roles
3. **Maintainability** - Update components, not pages
4. **Scalability** - Easy to add new views
5. **Performance** - Code splitting by role
6. **Testability** - Test components in isolation
7. **Developer Experience** - Clear patterns to follow

---

## File Organization

```
/src/
├── components/
│   ├── match/                    # Match detail components ✅
│   │   ├── match-venue-info.tsx
│   │   ├── match-court-datetime.tsx
│   │   ├── match-players-list.tsx
│   │   ├── match-payment.tsx
│   │   └── match-share-sheet.tsx
│   ├── venue/                    # Venue components (future)
│   │   ├── venue-header.tsx
│   │   ├── venue-description.tsx
│   │   ├── venue-operating-hours.tsx
│   │   ├── venue-amenities.tsx
│   │   └── venue-courts-list.tsx
│   ├── player/                   # Player profile components (future)
│   │   ├── player-header.tsx
│   │   ├── player-bio.tsx
│   │   ├── player-stats.tsx
│   │   └── player-recent-matches.tsx
│   ├── layout/
│   │   └── page-layout.tsx       # DEPRECATED - use AppHeader instead
│   ├── app-header.tsx            # ✅ Standard header
│   ├── app-bottom-nav.tsx        # ✅ Standard bottom nav
│   └── ui/                       # Shadcn components
├── app/
│   ├── (app)/
│   │   ├── players/
│   │   │   ├── match/[id]/       # Player match detail ✅
│   │   │   ├── player/[id]/      # Other player profile (future)
│   │   │   ├── venues/[id]/      # Player venue detail ✅
│   │   │   └── profile/          # Own profile ✅
│   │   └── admin/
│   │       ├── match/[id]/       # Admin match detail ✅
│   │       └── venue-profile/    # Admin venue profile ✅
│   ├── match/[id]/               # Public match detail ✅
│   ├── venue/[id]/               # Public venue detail ✅
│   └── player/[id]/              # Public player profile (future)
```

---

## Usage Examples

### Match Detail (Implemented)

```tsx
import { MatchVenueInfo } from "@/components/match/match-venue-info";
import { MatchCourtDateTime } from "@/components/match/match-court-datetime";
import { MatchPayment } from "@/components/match/match-payment";

// In any match detail page
<MatchVenueInfo venueName={venue.name} venueLocation={venue.location} />
<MatchCourtDateTime court={court} sportType={match.sport_type} date={matchDate} timeSlots={match.time_slots} isRecurring={match.is_recurring} />
<MatchPayment price={match.price} paymentStatus={match.payment_status} />
```

### Venue Detail (Proposed)

```tsx
import { VenueHeader } from "@/components/venue/venue-header";
import { VenueAmenities } from "@/components/venue/venue-amenities";
import { VenueCourtsList } from "@/components/venue/venue-courts-list";

// In any venue detail page
<VenueHeader name={venue.name} location={venue.location} rating={venue.rating} />
<VenueAmenities amenities={venue.amenities} />
<VenueCourtsList courts={venue.courts} />
```

---

## Migration Guide

When creating new pages with shared components:

1. **Create the page** in the appropriate directory
2. **Import shared components** from `/components/{domain}/`
3. **Use AppHeader** via layout (don't create custom headers)
4. **Follow spacing standards** (`space-y-6`, `pb-32`)
5. **Add role-specific logic** in the page, not in components
6. **Test across roles** to ensure consistency

---

**Last Updated**: 2025-10-04
**Architecture Version**: 2.0 (Post-Hybrid Implementation)
