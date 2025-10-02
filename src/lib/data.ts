// Core Type Definitions for Maidaan Platform

export interface Profile {
  id: string;
  contact_number: string;
  profile_type: 'admin' | 'player';
  name: string;
  email?: string;
  jersey_name?: string;
  jersey_number?: number;
  skill_level?: 'bronze' | 'silver' | 'gold';
  position?: string;
  bio?: string;
  avatar_url?: string;
  points: number;
  streak: number;
  matches: string[]; // Match IDs
  friends_list: string[]; // Player IDs
  stats?: {
    totalMatches: number;
    pointsEarned: number;
    daysStreak: number;
  };
  created_at: string;
  updated_at?: string;
}

export interface Venue {
  id: string;
  owner_admin_id: string;
  name: string;
  description?: string;
  location: string;
  images?: string[];
  rating?: number;
  operating_hours: {
    opening_time: string; // "06:00"
    closing_time: string; // "23:00"
  };
  cancellation_cutoff_hours: number; // e.g., 2
  amenities?: string[];
  courts: Court[];
  pricing_rules: PricingRule[];
  match_ids?: string[];
  created_at: string;
  updated_at?: string;
}

export interface Court {
  id: string;
  venue_id: string;
  sport_type: string;
  court_number: number;
  name: string; // "Basketball - Court 1"
  icon?: string;
  is_active: boolean;
}

export interface PricingRule {
  id: string;
  venue_id: string;
  time_period: 'morning' | 'afternoon' | 'evening';
  day_type: 'weekday' | 'weekend';
  price_per_hour: number;
}

export interface Match {
  id: string;
  venue_id: string;
  court_id: string;
  host_player_id: string;
  booker_name?: string; // If admin-booked
  booker_contact?: string;
  date: string; // "2024-09-27"
  time_slots: string[]; // ["17:00-18:00", "18:00-19:00"]
  sport_type: string;
  match_type: 'casual' | 'challenge';
  match_status: 'upcoming' | 'played';
  players_list: MatchPlayer[];
  price: number;
  payment_status: 'pending' | 'paid';
  payment_method?: 'cash' | 'qr';
  is_recurring: boolean;
  recurring_config?: {
    frequency: 'weekly' | 'monthly';
    end_date: string;
    parent_match_id?: string;
  };
  is_recurring_instance?: boolean;
  parent_match_id?: string;
  cancellation_allowed_until?: string; // ISO timestamp
  is_cancelled?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface MatchPlayer {
  player_id: string;
  is_host: boolean;
  invitation_status: 'invited' | 'joined';
  joined_at?: string;
}

export interface Sport {
  id: string;
  name: string;
  icon: string;
}

export interface Amenity {
  id: string;
  name: string;
  icon: string;
}

// Sports data
export const SPORTS: Sport[] = [
  { id: 'basketball', name: 'Basketball', icon: '🏀' },
  { id: 'volleyball', name: 'Volleyball', icon: '🏐' },
  { id: 'badminton', name: 'Badminton', icon: '🏸' },
  { id: 'football', name: 'Football', icon: '⚽' },
  { id: 'cricket', name: 'Cricket', icon: '🏏' },
  { id: 'tennis', name: 'Tennis', icon: '🎾' },
];

// Amenities data
export const AMENITIES: Amenity[] = [
  { id: 'parking', name: 'Parking', icon: '🅿️' },
  { id: 'changing-room', name: 'Changing Room', icon: '🚿' },
  { id: 'water', name: 'Drinking Water', icon: '💧' },
  { id: 'first-aid', name: 'First Aid', icon: '⚕️' },
  { id: 'equipment', name: 'Equipment Rental', icon: '🎽' },
  { id: 'cafe', name: 'Cafe', icon: '☕' },
];
