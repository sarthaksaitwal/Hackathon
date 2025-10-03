import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { realtimeDb } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';

export const useWorkersStore = create(
  persist(
    (set, get) => ({
      workers: [],
      error: null,

      fetchWorkers: () => {
        return new Promise((resolve, reject) => {
          const workersRef = ref(realtimeDb, 'workers');
          onValue(
            workersRef,
            (snapshot) => {
              const data = snapshot.val();
              if (data) {
                // Convert object to array
                const workersArray = Object.keys(data).map((key) => ({
                  id: key,
                  ...data[key],
                }));
                set({ workers: workersArray, error: null });
                resolve(workersArray);
              } else {
                set({ workers: [], error: null });
                resolve([]);
              }
            },
            (error) => {
              set({ error: error.message });
              reject(error);
            }
          );
        });
      },
    }),
    {
      name: 'civic-workers',
    }
  )
);
