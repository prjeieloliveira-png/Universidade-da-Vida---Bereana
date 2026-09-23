import { describe, it, expect, beforeEach } from 'vitest';
import { useCohortStore } from './cohortStore';

describe('useCohortStore', () => {
  beforeEach(() => {
    useCohortStore.getState().resetToDefault();
  });

  it('initializes with Turma 01 as default', () => {
    const { cohorts, activeCohortId } = useCohortStore.getState();
    expect(cohorts.length).toBe(1);
    expect(cohorts[0]?.name).toBe('Turma 01');
    expect(activeCohortId).toBe('turma-01');
  });

  it('creates a new cohort and sets it as active', () => {
    const newCohort = useCohortStore.getState().createCohort({
      name: 'Turma 02 - Sábado',
      startDate: '2026-10-01',
      targetStudents: 50,
      activeLeaderIds: ['leader-1', 'pastor-1'],
    });

    const state = useCohortStore.getState();
    expect(state.cohorts.length).toBe(2);
    expect(state.activeCohortId).toBe(newCohort.id);
    expect(newCohort.name).toBe('Turma 02 - Sábado');
    expect(newCohort.activeLeaderIds).toContain('leader-1');
  });

  it('allows switching the active cohort', () => {
    const newCohort = useCohortStore.getState().createCohort({
      name: 'Turma 02',
      startDate: '2026-10-01',
    });

    useCohortStore.getState().setActiveCohort('turma-01');
    expect(useCohortStore.getState().activeCohortId).toBe('turma-01');

    useCohortStore.getState().setActiveCohort(newCohort.id);
    expect(useCohortStore.getState().activeCohortId).toBe(newCohort.id);
  });

  it('toggles leader participation in a cohort', () => {
    const cohort = useCohortStore.getState().createCohort({
      name: 'Turma Test',
      startDate: '2026-10-01',
      activeLeaderIds: ['leader-1'],
    });

    useCohortStore.getState().toggleLeaderInCohort(cohort.id, 'leader-1');
    let updated = useCohortStore.getState().cohorts.find((c) => c.id === cohort.id);
    expect(updated?.activeLeaderIds).not.toContain('leader-1');

    useCohortStore.getState().toggleLeaderInCohort(cohort.id, 'leader-2');
    updated = useCohortStore.getState().cohorts.find((c) => c.id === cohort.id);
    expect(updated?.activeLeaderIds).toContain('leader-2');
  });
});
