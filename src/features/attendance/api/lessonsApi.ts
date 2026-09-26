import { supabase } from '@/shared/lib/supabase';
import type { LessonWeekInfo, WeekNumber } from '../types';

/**
 * Busca as 9 aulas da edição no Supabase (tema, título e o rótulo de data
 * livre). session_date (tipo `date`) não é usado pelo app — o texto exibido
 * fica em session_date_label, que aceita qualquer formato ("07 de Março").
 */
export async function fetchLessonsFromSupabase(editionId: string): Promise<LessonWeekInfo[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select('session_number, title, theme, session_date_label')
    .eq('edition_id', editionId)
    .order('session_number', { ascending: true });

  if (error) {
    console.error('Erro ao buscar aulas do Supabase:', error);
    throw error;
  }

  return (data || []).map((row) => ({
    number: row.session_number as WeekNumber,
    key: `s${row.session_number}` as LessonWeekInfo['key'],
    title: row.title || `Semana ${row.session_number}`,
    theme: row.theme || 'A Definir',
    dateStr: row.session_date_label || '',
  }));
}

/**
 * Atualiza o tema/título/data de uma aula da edição (coordenação/secretaria).
 */
export async function updateLessonInSupabase(
  editionId: string,
  sessionNumber: number,
  updates: { title: string; theme: string; dateStr: string }
): Promise<void> {
  const { error } = await supabase
    .from('lessons')
    .update({
      title: updates.title,
      theme: updates.theme,
      session_date_label: updates.dateStr,
    })
    .eq('edition_id', editionId)
    .eq('session_number', sessionNumber);

  if (error) {
    console.error('Erro ao salvar aula no Supabase:', error);
    throw error;
  }
}
