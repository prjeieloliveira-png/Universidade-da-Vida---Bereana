import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Cohort, CreateCohortInput } from '../types';

export const INITIAL_COHORTS: Cohort[] = [
  {
    id: 'turma-01',
    name: 'Turma 01',
    code: 'T01',
    startDate: '2026-09-20',
    encounterDate: '2026-11-28',
    status: 'ACTIVE',
    targetStudents: 70,
    registrationFeeCents: 20000,
    activeLeaderIds: [], // Empty means all leaders in catalog are active for Turma 01
    createdAt: '2026-09-20T10:00:00.000Z',
  },
];

interface CohortStoreState {
  cohorts: Cohort[];
  activeCohortId: string;
  getActiveCohort: () => Cohort;
  setActiveCohort: (id: string) => void;
  createCohort: (input: CreateCohortInput) => Cohort;
  updateCohort: (id: string, updates: Partial<Cohort>) => void;
  deleteCohort: (id: string) => void;
  toggleLeaderInCohort: (cohortId: string, leaderId: string) => void;
  setCohortLeaders: (cohortId: string, leaderIds: string[]) => void;
  resetToDefault: () => void;
}

export const useCohortStore = create<CohortStoreState>()(
  persist(
    (set, get) => ({
      cohorts: INITIAL_COHORTS,
      activeCohortId: 'turma-01',

      getActiveCohort: () => {
        const { cohorts, activeCohortId } = get();
        return (
          cohorts.find((c) => c.id === activeCohortId) ||
          cohorts[0] ||
          INITIAL_COHORTS[0]!
        );
      },

      setActiveCohort: (id) => set({ activeCohortId: id }),

      createCohort: (input) => {
        const currentCount = get().cohorts.length;
        const num = currentCount + 1;
        const padNum = String(num).padStart(2, '0');
        const newId = `turma-${padNum}-${Date.now()}`;
        const newCode = input.code?.trim() || `T${padNum}`;

        const created: Cohort = {
          id: newId,
          name: input.name.trim() || `Turma ${padNum}`,
          code: newCode,
          startDate: input.startDate || new Date().toISOString().split('T')[0]!,
          encounterDate: input.encounterDate,
          status: 'ACTIVE',
          targetStudents: input.targetStudents || 70,
          registrationFeeCents: input.registrationFeeCents || 20000,
          activeLeaderIds: input.activeLeaderIds || [],
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          cohorts: [...state.cohorts, created],
          activeCohortId: created.id,
        }));

        return created;
      },

      updateCohort: (id, updates) =>
        set((state) => ({
          cohorts: state.cohorts.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),

      deleteCohort: (id) =>
        set((state) => {
          if (state.cohorts.length <= 1) return state; // Don't delete the only remaining cohort
          const remaining = state.cohorts.filter((c) => c.id !== id);
          const newActive = state.activeCohortId === id ? remaining[0]!.id : state.activeCohortId;
          return {
            cohorts: remaining,
            activeCohortId: newActive,
          };
        }),

      toggleLeaderInCohort: (cohortId, leaderId) =>
        set((state) => ({
          cohorts: state.cohorts.map((c) => {
            if (c.id !== cohortId) return c;
            const currentLeaders = c.activeLeaderIds || [];
            const exists = currentLeaders.includes(leaderId);
            const updated = exists
              ? currentLeaders.filter((id) => id !== leaderId)
              : [...currentLeaders, leaderId];
            return { ...c, activeLeaderIds: updated };
          }),
        })),

      setCohortLeaders: (cohortId, leaderIds) =>
        set((state) => ({
          cohorts: state.cohorts.map((c) =>
            c.id === cohortId ? { ...c, activeLeaderIds: leaderIds } : c
          ),
        })),

      resetToDefault: () =>
        set({
          cohorts: INITIAL_COHORTS,
          activeCohortId: 'turma-01',
        }),
    }),
    {
      name: 'bereana_cohort_store_v1',
    }
  )
);
