// User Profile Types
export interface Profile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: "user" | "admin" | "venue_owner";
  createdAt: Date;
  updatedAt: Date;
}

// Venue Types
export interface Venue {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  ownerId: string;
  sports: string[];
  amenities: string[];
  images: string[];
  pricePerHour: number;
  rating: number;
  totalReviews: number;
  availability: VenueAvailability[];
  createdAt: Date;
  updatedAt: Date;
}

export interface VenueAvailability {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // "09:00"
  endTime: string; // "22:00"
  isAvailable: boolean;
}

// Match/Booking Types
export interface Match {
  id: string;
  venueId: string;
  organizerId: string;
  sport: string;
  title: string;
  description?: string;
  date: Date;
  startTime: string;
  endTime: string;
  maxPlayers: number;
  currentPlayers: number;
  participants: Participant[];
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  pricePerPlayer: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Participant {
  userId: string;
  userName: string;
  joinedAt: Date;
  paymentStatus: "pending" | "paid" | "refunded";
}

// Booking Types
export interface Booking {
  id: string;
  venueId: string;
  userId: string;
  date: Date;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus: "pending" | "paid" | "refunded";
  createdAt: Date;
  updatedAt: Date;
}

// Review Types
export interface Review {
  id: string;
  venueId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

// Payment Types
export interface Payment {
  id: string;
  userId: string;
  bookingId?: string;
  matchId?: string;
  amount: number;
  status: "pending" | "completed" | "failed" | "refunded";
  paymentMethod: string;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}
