import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { studentsList } from '../data/mockStudents';
import { useCohortStore } from '@/features/cohorts/store/cohortStore';
import type { StudentRecord } from '../types';
import type { WeekNumber, WeekKey } from '@/features/attendance/types';

function calculateAge(birthDateStr: string): number {
  if (!birthDateStr) return 0;
  const parts = birthDateStr.split('-');
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) return 0;
  const birthYear = parseInt(parts[0], 10);
  const birthMonth = parseInt(parts[1], 10) - 1;
  const birthDay = parseInt(parts[2], 10);
  const today = new Date(2026, 8, 20); // 20/09/2026 reference date
  let age = today.getFullYear() - birthYear;
  const m = today.getMonth() - birthMonth;
  if (m < 0 || (m === 0 && today.getDate() < birthDay)) {
    age--;
  }
  return Math.max(0, age);
}

function mapRawToRecord(raw: (typeof studentsList)[0] & { cohortId?: string }): StudentRecord {
  return {
    id: `reg-${raw.num}`,
    cohortId: raw.cohortId || 'turma-01',
    personId: `person-${raw.num}`,
    num: raw.num,
    name: raw.name,
    gender: raw.gender,
    birthDate: raw.birthDate,
    age: calculateAge(raw.birthDate),
    maritalStatus: raw.maritalStatus || 'Solteiro',
    phone: raw.phone || '—',
    address: raw.address || '—',
    shirtSize: raw.shirtSize || '—',
    pastor: raw.pastor,
    g12: raw.g12,
    leader: raw.leader,
    status: raw.status,
    paymentMethod: raw.paymentMethod || '—',
    amountCents: 20000,
    comorbidity: raw.comorbidity || 'Não',
    medSchedule: raw.medSchedule || 'Não',
    photoUrl: undefined,
    s1: raw.s1 ?? false,
    s2: raw.s2 ?? false,
    s3: raw.s3 ?? false,
    s4: raw.s4 ?? false,
    s5: false,
    s6: false,
    s7: false,
    s8: false,
    s9: false,
  };
}


interface StudentStoreState {
  students: StudentRecord[];
  searchQuery: string;
  filterStatus: 'ALL' | 'Pago' | 'Pendente';
  filterPastor: string;
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: 'ALL' | 'Pago' | 'Pendente') => void;
  setFilterPastor: (pastor: string) => void;
  updateStudent: (student: StudentRecord) => void;
  addStudent: (student: Omit<StudentRecord, 'id' | 'personId' | 'num' | 'age'>) => void;
  toggleAttendance: (studentId: string, week: WeekNumber) => void;
  setBulkAttendance: (studentIds: string[], week: WeekNumber, present: boolean) => void;
  resetToDefault: () => void;
}

export const useStudentStore = create<StudentStoreState>()(
  persist(
    (set) => ({
      students: studentsList.map(mapRawToRecord),
      searchQuery: '',
      filterStatus: 'ALL',
      filterPastor: 'ALL',
      setSearchQuery: (query) => set({ searchQuery: query }),
      setFilterStatus: (status) => set({ filterStatus: status }),
      setFilterPastor: (pastor) => set({ filterPastor: pastor }),
      updateStudent: (updated) =>
        set((state) => ({
          students: state.students.map((s) =>
            s.id === updated.id
              ? {
                  ...updated,
                  age: calculateAge(updated.birthDate),
                  s5: updated.s5 ?? false,
                  s6: updated.s6 ?? false,
                  s7: updated.s7 ?? false,
                  s8: updated.s8 ?? false,
                  s9: updated.s9 ?? false,
                }
              : s
          ),
        })),
      addStudent: (newStudent) =>
        set((state) => {
          const nextNum = state.students.length + 1;
          const targetCohortId =
            newStudent.cohortId ||
            useCohortStore.getState().activeCohortId ||
            'turma-01';
          const created: StudentRecord = {
            ...newStudent,
            id: `reg-${nextNum}`,
            cohortId: targetCohortId,
            personId: `person-${nextNum}`,
            num: nextNum,
            age: calculateAge(newStudent.birthDate),
            s5: newStudent.s5 ?? false,
            s6: newStudent.s6 ?? false,
            s7: newStudent.s7 ?? false,
            s8: newStudent.s8 ?? false,
            s9: newStudent.s9 ?? false,
          };
          return { students: [created, ...state.students] };
        }),
      toggleAttendance: (studentId, week) =>
        set((state) => {
          const key = `s${week}` as WeekKey;
          return {
            students: state.students.map((s) =>
              s.id === studentId ? { ...s, [key]: !s[key] } : s
            ),
          };
        }),
      setBulkAttendance: (studentIds, week, present) =>
        set((state) => {
          const key = `s${week}` as WeekKey;
          const setIds = new Set(studentIds);
          return {
            students: state.students.map((s) =>
              setIds.has(s.id) ? { ...s, [key]: present } : s
            ),
          };
        }),
      resetToDefault: () => set({ students: studentsList.map(mapRawToRecord) }),
    }),
    {
      name: 'bereana_students_store_v1',
      version: 4,
      migrate: (persistedState: unknown) => {
        const state = persistedState as { students?: StudentRecord[] };
        if (state && Array.isArray(state.students)) {
          return {
            ...state,
            students: state.students.map((s) => ({
              ...s,
              cohortId: s.cohortId || 'turma-01',
              photoUrl: s.photoUrl ?? undefined,
              s5: s.s5 ?? false,
              s6: s.s6 ?? false,
              s7: s.s7 ?? false,
              s8: s.s8 ?? false,
              s9: s.s9 ?? false,
            })),
          };
        }
        return state;
      },
    }
  )
);

