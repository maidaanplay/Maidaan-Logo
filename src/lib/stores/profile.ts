import { create } from 'zustand';
import { Profile } from '../data';
import { supabase } from '../supabase';

interface ProfileStore {
  profile: Profile | null;
  isLoading: boolean;
  setProfile: (profile: Profile | null) => void;
  loadProfile: (contactNumber: string) => Promise<Profile | null>;
  loadCurrentUser: () => Promise<Profile | null>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  logout: () => Promise<void>;
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profile: null,
  isLoading: true,

  setProfile: (profile) => {
    // Persist to localStorage
    if (profile) {
      localStorage.setItem('maidaan_profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('maidaan_profile');
    }
    set({ profile, isLoading: false });
  },

  loadCurrentUser: async () => {
    set({ isLoading: true });

    try {
      // Load from localStorage
      const storedProfile = localStorage.getItem('maidaan_profile');

      if (storedProfile) {
        const profile = JSON.parse(storedProfile);
        set({ profile, isLoading: false });
        return profile;
      }

      set({ profile: null, isLoading: false });
      return null;
    } catch (error) {
      console.error('Error loading current user:', error);
      set({ profile: null, isLoading: false });
      return null;
    }
  },

  loadProfile: async (contactNumber: string) => {
    set({ isLoading: true });

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('contact_number', contactNumber)
        .single();

      if (error) throw error;

      // Calculate stats if needed
      if (profile && profile.matches?.length > 0) {
        const { data: matches } = await supabase
          .from('matches')
          .select('*')
          .in('id', profile.matches);

        const stats = {
          totalMatches: matches?.length || 0,
          pointsEarned: matches?.reduce((sum: number, match: any) => {
            return sum + (match.host_player_id === profile.id ? 50 : 10);
          }, 0) || 0,
          daysStreak: 0, // TODO: Implement streak calculation
        };

        profile.stats = stats;
      }

      set({ profile, isLoading: false });
      return profile;
    } catch (error) {
      console.error('Error loading profile:', error);
      set({ isLoading: false });
      return null;
    }
  },

  updateProfile: async (updates) => {
    const { profile } = get();
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);

      if (error) throw error;

      set({ profile: { ...profile, ...updates } });
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  },

  logout: async () => {
    localStorage.removeItem('maidaan_profile');
    set({ profile: null, isLoading: false });
  },
}));
