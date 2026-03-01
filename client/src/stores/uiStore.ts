import { create } from "zustand";

interface UIState {
  sidebarCollapsed: boolean;
  postDialogOpen: boolean;
  selectedPostId: string | null;
  searchQuery: string;
  filters: {
    platform: string | null;
    status: string | null;
    eventId: string | null;
    collaboratorId: string | null;
    tagId: string | null;
  };
  toggleSidebar: () => void;
  openPostDialog: (postId?: string) => void;
  closePostDialog: () => void;
  setSearchQuery: (query: string) => void;
  setFilter: (key: keyof UIState["filters"], value: string | null) => void;
  clearFilters: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  postDialogOpen: false,
  selectedPostId: null,
  searchQuery: "",
  filters: {
    platform: null,
    status: null,
    eventId: null,
    collaboratorId: null,
    tagId: null,
  },
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  openPostDialog: (postId) => set({ postDialogOpen: true, selectedPostId: postId ?? null }),
  closePostDialog: () => set({ postDialogOpen: false, selectedPostId: null }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value } })),
  clearFilters: () =>
    set({
      filters: { platform: null, status: null, eventId: null, collaboratorId: null, tagId: null },
    }),
}));
