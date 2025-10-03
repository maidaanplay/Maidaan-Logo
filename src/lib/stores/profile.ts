import { create } from 'zustand';
import { Profile } from '../data';
import { supabase } from '../supabase';

interface ProfileStore {
  profile: Profile | null;
  isLoading: boolean;
  setProfile: (profile: Profile | null) => void;
  loadCurrentUser: () => Promise<Profile | null>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  logout: () => Promise<void>;
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profile: null,
  isLoading: true,

  setProfile: (profile) => {
    set({ profile, isLoading: false });
  },

  loadCurrentUser: async () => {
    set({ isLoading: true });

    try {
      // Get current session from Supabase Auth
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session?.user) {
        set({ profile: null, isLoading: false });
        return null;
      }

      // Load profile from database using authenticated user's ID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      if (profile) {
        // Calculate stats if needed
        if (profile.matches?.length > 0) {
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
      }

      set({ profile: null, isLoading: false });
      return null;
    } catch (error) {
      console.error('Error loading current user:', error);
      set({ profile: null, isLoading: false });
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

      const updatedProfile = { ...profile, ...updates };
      set({ profile: updatedProfile });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
      set({ profile: null, isLoading: false });
    } catch (error) {
      console.error('Error signing out:', error);
      set({ profile: null, isLoading: false });
    }
  },
}));
