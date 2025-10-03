import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = {
            id: userCredential.user.uid,
            name: userCredential.user.displayName || 'User',
            email: userCredential.user.email,
            role: 'Civic Administrator', // You can fetch this from Firestore or custom claims
            avatar: userCredential.user.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
          };
          set({ user, isAuthenticated: true, isLoading: false });
          return true;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      logout: async () => {
        try {
          await signOut(auth);
          set({ user: null, isAuthenticated: false, isLoading: false });
        } catch (error) {
          set({ error: error.message });
        }
      },

      setLoading: (loading) => set({ isLoading: loading }),

      initialize: () => {
        onAuthStateChanged(auth, (firebaseUser) => {
          if (firebaseUser) {
            const user = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email,
              role: 'Civic Administrator',
              avatar: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
            };
            set({ user, isAuthenticated: true, isLoading: false });
          } else {
            set({ user: null, isAuthenticated: false, isLoading: false });
          }
        });
      },
    }),
    {
      name: 'civic-auth',
      // Removed onRehydrateStorage for testing: just restore state from storage
    }
  )
);
