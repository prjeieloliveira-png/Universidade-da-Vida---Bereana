export type WeekNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type WeekKey = 's1' | 's2' | 's3' | 's4' | 's5' | 's6' | 's7' | 's8' | 's9';

export interface LessonWeekInfo {
  number: WeekNumber;
  key: WeekKey;
  title: string;
  theme: string;
  dateStr: string;
}

export const LESSON_WEEKS: LessonWeekInfo[] = [
  {
    number: 1,
    key: 's1',
    title: 'Semana 1',
    theme: 'O Encontro com Deus',
    dateStr: '07 de Março',
  },
  {
    number: 2,
    key: 's2',
    title: 'Semana 2',
    theme: 'Quebrando Maldições e Libertação',
    dateStr: '14 de Março',
  },
  {
    number: 3,
    key: 's3',
    title: 'Semana 3',
    theme: 'Cura Interior e Perdão',
    dateStr: '21 de Março',
  },
  {
    number: 4,
    key: 's4',
    title: 'Semana 4',
    theme: 'O Batismo no Espírito Santo',
    dateStr: '28 de Março',
  },
  {
    number: 5,
    key: 's5',
    title: 'Semana 5',
    theme: 'A Definir',
    dateStr: '04 de Abril',
  },
  {
    number: 6,
    key: 's6',
    title: 'Semana 6',
    theme: 'A Definir',
    dateStr: '11 de Abril',
  },
  {
    number: 7,
    key: 's7',
    title: 'Semana 7',
    theme: 'A Definir',
    dateStr: '18 de Abril',
  },
  {
    number: 8,
    key: 's8',
    title: 'Semana 8',
    theme: 'A Definir',
    dateStr: '25 de Abril',
  },
  {
    number: 9,
    key: 's9',
    title: 'Semana 9',
    theme: 'A Definir',
    dateStr: '02 de Maio',
  },
];

