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
      const { data: venues, error } = await supabase
        .from('venues')
        .select('*, courts(*), pricing_rules(*)');

      if (error) throw error;

      set({ venues: venues || [], isLoading: false });
    } catch (error) {
      console.error('Error loading venues:', error);
      set({ isLoading: false });
    }
  },

  loadVenueById: async (id: string) => {
    try {
      const { data: venue, error } = await supabase
        .from('venues')
        .select('*, courts(*), pricing_rules(*)')
        .eq('id', id)
        .single();

      if (error) throw error;

      return venue;
    } catch (error) {
      console.error('Error loading venue:', error);
      return null;
    }
  },

  loadAdminVenue: async (adminId: string) => {
    try {
      const { data: venue, error } = await supabase
        .from('venues')
        .select('*, courts(*), pricing_rules(*)')
        .eq('owner_admin_id', adminId)
        .single();

      if (error) throw error;

      set({ selectedVenue: venue });
      return venue;
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
