import { create } from 'zustand';
import { Venue } from '../data';
import { supabase } from '../supabase';

interface VenueStore {
  venues: Venue[];
  selectedVenue: Venue | null;
  isLoading: boolean;
  loadVenues: () => Promise<void>;
  loadVenueById: (id: string) => Promise<Venue | null>;
  loadAdminVenue: (adminId: string) => Promise<Venue | null>;
  setSelectedVenue: (venue: Venue | null) => void;
  getVenue: (id: string) => Venue | undefined;
}

export const useVenueStore = create<VenueStore>((set, get) => ({
  venues: [],
  selectedVenue: null,
  isLoading: false,

  loadVenues: async () => {
    set({ isLoading: true });

    try {
      const response = await fetch('/api/venue');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load venues');
      }

      set({ venues: result.venues || [], isLoading: false });
    } catch (error) {
      console.error('Error loading venues:', error);
      set({ isLoading: false });
    }
  },

  loadVenueById: async (id: string) => {
    try {
      const response = await fetch(`/api/venue?venueId=${id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load venue');
      }

      return result.venue;
    } catch (error) {
      console.error('Error loading venue:', error);
      return null;
    }
  },

  loadAdminVenue: async (adminId: string) => {
    try {
      const response = await fetch(`/api/venue?adminId=${adminId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load venue');
      }

      set({ selectedVenue: result.venue });
      return result.venue;
    } catch (error) {
      console.error('Error loading admin venue:', error);
      return null;
    }
  },

  setSelectedVenue: (venue) => set({ selectedVenue: venue }),

  getVenue: (id) => {
    const { venues } = get();
    return venues.find((v) => v.id === id);
  },
}));
