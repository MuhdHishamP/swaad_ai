// ============================================================
// User Store — Simple auth with localStorage
// WHY: The assignment calls for a simple auth system (name + email).
// No passwords, no JWT — just enough to personalize the experience
// and gate checkout behind user identification.
// ============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserProfile {
  name: string;
  email: string;
}

interface UserState {
  user: UserProfile | null;
  hasSeenWelcome: boolean;

  /** Set user profile after welcome form */
  setUser: (profile: UserProfile) => void;
  /** Clear user data (logout) */
  clearUser: () => void;
  /** Mark welcome as seen (even if dismissed) */
  markWelcomeSeen: () => void;
  /** Check if user has provided auth info */
  isAuthenticated: () => boolean;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      hasSeenWelcome: false,

      setUser: (profile) => {
        set({ user: profile, hasSeenWelcome: true });
      },

      clearUser: () => {
        set({ user: null, hasSeenWelcome: false });
      },

      markWelcomeSeen: () => {
        set({ hasSeenWelcome: true });
      },

      isAuthenticated: () => {
        return get().user !== null;
      },
    }),
    {
      name: "swaad-user",
    }
  )
);
