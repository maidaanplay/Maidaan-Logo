import { create } from 'zustand';

interface UIStore {
  searchQuery: string;
  selectedSport: string | null;
  setSearchQuery: (query: string) => void;
  setSelectedSport: (sport: string | null) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  searchQuery: '',
  selectedSport: null,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedSport: (sport) => set({ selectedSport: sport }),
}));
