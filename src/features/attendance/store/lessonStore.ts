import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LESSON_WEEKS, LessonWeekInfo, WeekNumber } from '../types';

interface LessonStoreState {
  lessons: LessonWeekInfo[];
  updateLesson: (weekNumber: WeekNumber, updates: Partial<Omit<LessonWeekInfo, 'number' | 'key'>>) => void;
  /** Substitui os temas locais pelos dados vindos do Supabase (fonte da verdade). */
  hydrateLessons: (remoteLessons: LessonWeekInfo[]) => void;
  resetLessons: () => void;
  resetToDefault: () => void;
}

export const useLessonStore = create<LessonStoreState>()(
  persist(
    (set) => ({
      lessons: LESSON_WEEKS,
      updateLesson: (weekNumber, updates) =>
        set((state) => ({
          lessons: state.lessons.map((lesson) =>
            lesson.number === weekNumber ? { ...lesson, ...updates } : lesson
          ),
        })),
      hydrateLessons: (remoteLessons) =>
        set((state) => ({
          lessons: state.lessons.map((lesson) => {
            const remote = remoteLessons.find((r) => r.number === lesson.number);
            if (!remote) return lesson;
            // Um tema/data ainda "A Definir"/vazio no banco não sobrescreve o rascunho local
            return {
              ...lesson,
              title: remote.title || lesson.title,
              theme: remote.theme && remote.theme !== 'A Definir' ? remote.theme : lesson.theme,
              dateStr: remote.dateStr || lesson.dateStr,
            };
          }),
        })),
      resetLessons: () => set({ lessons: LESSON_WEEKS }),
      resetToDefault: () => set({ lessons: LESSON_WEEKS }),
    }),
    {
      name: 'bereana_lessons_store_v1',
    }
  )
);
