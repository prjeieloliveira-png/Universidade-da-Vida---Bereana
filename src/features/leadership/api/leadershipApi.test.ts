import { describe, it, expect, vi } from 'vitest';
import { fetchPastors, createPastor } from './leadershipApi';
import { supabase } from '@/shared/lib/supabase';

vi.mock('@/shared/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('leadershipApi', () => {
  it('fetchPastors fetches and formats pastors correctly', async () => {
    const mockPastors = [
      { id: 'uuid-1', name: 'Pra. Socorro Paiva', phone: '85999999999', active: true },
    ];

    (supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockPastors, error: null }),
      }),
    });

    const result = await fetchPastors();
    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe('Pra. Socorro Paiva');
  });

  it('createPastor inserts a new pastor and returns id', async () => {
    (supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: 'new-id' }, error: null }),
        }),
      }),
    });

    const id = await createPastor('Pr. Novo Teste', '85988888888');
    expect(id).toBe('new-id');
  });
});
