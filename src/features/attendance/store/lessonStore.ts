import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LESSON_WEEKS, LessonWeekInfo, WeekNumber } from '../types';

interface LessonStoreState {
  lessons: LessonWeekInfo[];
  updateLesson: (weekNumber: WeekNumber, updates: Partial<Omit<LessonWeekInfo, 'number' | 'key'>>) => void;
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
      resetLessons: () => set({ lessons: LESSON_WEEKS }),
      resetToDefault: () => set({ lessons: LESSON_WEEKS }),
    }),
    {
      name: 'bereana_lessons_store_v1',
    }
  )
);
