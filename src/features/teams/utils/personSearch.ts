import { supabase } from '@/shared/lib/supabase';
import { unmaskPhone } from '@/shared/utils/phone';

/**
 * Função utilitária para busca debounced de pessoas por telefone
 */
export async function searchPersonByPhone(phoneDigits: string) {
  const digits = unmaskPhone(phoneDigits);
  if (digits.length < 8) return null;

  const { data, error } = await supabase
    .from('people')
    .select('id, full_name, phone')
    .ilike('phone', `%${digits}%`)
    .limit(1);

  if (error || !data || data.length === 0) return null;
  return data[0];
}
