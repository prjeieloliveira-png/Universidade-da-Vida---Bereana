import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PastorRecord, G12Record, LeaderRecord } from '../types';
import { initialPastors, initialG12s, initialLeaders } from '../data/initialLeadership';

interface LeadershipStoreState {
  pastors: PastorRecord[];
  g12s: G12Record[];
  leaders: LeaderRecord[];

  // Pastors
  addPastor: (name: string, phone?: string) => void;
  updatePastor: (id: string, name: string, phone?: string) => void;
  deletePastor: (id: string) => void;

  // G12
  addG12: (name: string, pastorId: string, phone?: string) => void;
  updateG12: (id: string, name: string, pastorId: string, phone?: string) => void;
  deleteG12: (id: string) => void;

  // Cell Leaders
  addLeader: (name: string, g12Id: string, phone?: string) => void;
  updateLeader: (id: string, name: string, g12Id: string, phone?: string) => void;
  deleteLeader: (id: string) => void;

  resetToDefault: () => void;
}

export const useLeadershipStore = create<LeadershipStoreState>()(
  persist(
    (set) => ({
      pastors: initialPastors,
      g12s: initialG12s,
      leaders: initialLeaders,

      addPastor: (name, phone) =>
        set((state) => {
          const newPastor: PastorRecord = {
            id: `pastor-${Date.now()}`,
            name: name.trim(),
            phone: phone?.trim(),
            active: true,
          };
          return { pastors: [...state.pastors, newPastor] };
        }),

      updatePastor: (id, name, phone) =>
        set((state) => {
          const trimmedName = name.trim();
          return {
            pastors: state.pastors.map((p) =>
              p.id === id ? { ...p, name: trimmedName, phone: phone?.trim() } : p
            ),
            // Update denormalized pastorName in g12s and leaders
            g12s: state.g12s.map((g) =>
              g.pastorId === id ? { ...g, pastorName: trimmedName } : g
            ),
            leaders: state.leaders.map((l) => {
              const g12 = state.g12s.find((g) => g.id === l.g12Id);
              return g12 && g12.pastorId === id ? { ...l, pastorName: trimmedName } : l;
            }),
          };
        }),

      deletePastor: (id) =>
        set((state) => ({
          pastors: state.pastors.filter((p) => p.id !== id),
        })),

      addG12: (name, pastorId, phone) =>
        set((state) => {
          const pastor = state.pastors.find((p) => p.id === pastorId);
          const newG12: G12Record = {
            id: `g12-${Date.now()}`,
            name: name.trim(),
            pastorId,
            pastorName: pastor?.name || '',
            phone: phone?.trim(),
            active: true,
          };
          return { g12s: [...state.g12s, newG12] };
        }),

      updateG12: (id, name, pastorId, phone) =>
        set((state) => {
          const pastor = state.pastors.find((p) => p.id === pastorId);
          const trimmedName = name.trim();
          const pastorName = pastor?.name || '';
          return {
            g12s: state.g12s.map((g) =>
              g.id === id
                ? { ...g, name: trimmedName, pastorId, pastorName, phone: phone?.trim() }
                : g
            ),
            // Update denormalized g12Name in leaders
            leaders: state.leaders.map((l) =>
              l.g12Id === id
                ? { ...l, g12Name: trimmedName, pastorName: pastorName || l.pastorName }
                : l
            ),
          };
        }),

      deleteG12: (id) =>
        set((state) => ({
          g12s: state.g12s.filter((g) => g.id !== id),
        })),

      addLeader: (name, g12Id, phone) =>
        set((state) => {
          const g12 = state.g12s.find((g) => g.id === g12Id);
          const newLeader: LeaderRecord = {
            id: `leader-${Date.now()}`,
            name: name.trim(),
            g12Id,
            g12Name: g12?.name || '',
            pastorName: g12?.pastorName || '',
            phone: phone?.trim(),
            active: true,
          };
          return { leaders: [...state.leaders, newLeader] };
        }),

      updateLeader: (id, name, g12Id, phone) =>
        set((state) => {
          const g12 = state.g12s.find((g) => g.id === g12Id);
          return {
            leaders: state.leaders.map((l) =>
              l.id === id
                ? {
                    ...l,
                    name: name.trim(),
                    g12Id,
                    g12Name: g12?.name || '',
                    pastorName: g12?.pastorName || l.pastorName,
                    phone: phone?.trim(),
                  }
                : l
            ),
          };
        }),

      deleteLeader: (id) =>
        set((state) => ({
          leaders: state.leaders.filter((l) => l.id !== id),
        })),

      resetToDefault: () =>
        set({
          pastors: initialPastors,
          g12s: initialG12s,
          leaders: initialLeaders,
        }),
    }),
    {
      name: 'bereana_leadership_store_v1',
    }
  )
);
