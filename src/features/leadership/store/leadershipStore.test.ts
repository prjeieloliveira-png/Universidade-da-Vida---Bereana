import { describe, it, expect, beforeEach } from 'vitest';
import { useLeadershipStore } from './leadershipStore';

describe('leadershipStore', () => {
  beforeEach(() => {
    useLeadershipStore.getState().resetToDefault();
  });

  it('initializes with default pastors, g12s and leaders', () => {
    const state = useLeadershipStore.getState();
    expect(state.pastors.length).toBeGreaterThanOrEqual(2);
    expect(state.g12s.length).toBeGreaterThanOrEqual(18);
    expect(state.leaders.length).toBeGreaterThanOrEqual(27);
  });

  it('allows adding and updating a pastor', () => {
    const store = useLeadershipStore.getState();
    store.addPastor('Pr. Teste Silva', '(86) 99999-0000');
    let pastors = useLeadershipStore.getState().pastors;
    const added = pastors.find((p) => p.name === 'Pr. Teste Silva');
    expect(added).toBeDefined();

    if (added) {
      store.updatePastor(added.id, 'Pr. Teste Silva Atualizado', '(86) 99999-1111');
      pastors = useLeadershipStore.getState().pastors;
      const updated = pastors.find((p) => p.id === added.id);
      expect(updated?.name).toBe('Pr. Teste Silva Atualizado');
    }
  });

  it('allows adding and updating a g12 linked to a pastor', () => {
    const store = useLeadershipStore.getState();
    const pastor = store.pastors[0]!;
    store.addG12('Líder G12 Novo', pastor.id);
    const g12s = useLeadershipStore.getState().g12s;
    const added = g12s.find((g) => g.name === 'Líder G12 Novo');
    expect(added).toBeDefined();
    expect(added?.pastorName).toBe(pastor.name);
  });

  it('allows adding and updating a cell leader linked to a g12', () => {
    const store = useLeadershipStore.getState();
    const g12 = store.g12s[0]!;
    store.addLeader('Líder Célula Novo', g12.id);
    const leaders = useLeadershipStore.getState().leaders;
    const added = leaders.find((l) => l.name === 'Líder Célula Novo');
    expect(added).toBeDefined();
    expect(added?.g12Name).toBe(g12.name);
    expect(added?.pastorName).toBe(g12.pastorName);
  });
});
