import { describe, it, expect, beforeEach } from 'vitest';
import { useLessonStore } from './lessonStore';

describe('useLessonStore', () => {
  beforeEach(() => {
    useLessonStore.getState().resetToDefault();
  });

  it('initializes with 9 weeks of lessons', () => {
    const lessons = useLessonStore.getState().lessons;
    expect(lessons.length).toBe(9);
    expect(lessons[0]?.number).toBe(1);
    expect(lessons[8]?.number).toBe(9);
    expect(lessons[0]?.theme).toBe('O Encontro com Deus');
    expect(lessons[4]?.theme).toBe('A Definir');
  });

  it('updates lesson theme, title and date correctly', () => {
    useLessonStore.getState().updateLesson(5, {
      title: 'Aula 5',
      theme: 'Poder do Espírito Santo',
      dateStr: '11/04',
    });

    const lesson5 = useLessonStore.getState().lessons.find((l) => l.number === 5);
    expect(lesson5).toBeDefined();
    expect(lesson5?.title).toBe('Aula 5');
    expect(lesson5?.theme).toBe('Poder do Espírito Santo');
    expect(lesson5?.dateStr).toBe('11/04');
  });

  it('can reset back to default 9 weeks', () => {
    useLessonStore.getState().updateLesson(9, {
      title: 'Encerramento',
      theme: 'Formatura',
      dateStr: '09/05',
    });

    useLessonStore.getState().resetToDefault();
    const lesson9 = useLessonStore.getState().lessons.find((l) => l.number === 9);
    expect(lesson9?.theme).toBe('A Definir');
  });
});
