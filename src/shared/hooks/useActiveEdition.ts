import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import type { Database } from '@/shared/types/database';

type EditionRow = Database['public']['Tables']['editions']['Row'];

export function useActiveEdition() {
  return useQuery<EditionRow | null>({
    queryKey: ['active-edition'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('editions')
        .select(
          'id, name, year, code, start_date, end_date, encounter_date, registration_fee_cents, total_lessons, target_students, status, is_active, created_at'
        )
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return data as EditionRow | null;
    },
    staleTime: 5 * 60 * 1000,
  });
}
