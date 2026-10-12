import type { StudentRecord, RegistrationFilterState } from '../types';
import { sortByName } from '@/shared/utils/sortByName';

export function filterStudents<T extends StudentRecord>(
  students: T[],
  filters: RegistrationFilterState
): T[] {
  return students.filter((s) => {
    // 1. Text Search
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      const matchesSearch =
        s.name.toLowerCase().includes(query) ||
        s.phone.toLowerCase().includes(query) ||
        s.pastor.toLowerCase().includes(query) ||
        s.g12.toLowerCase().includes(query) ||
        s.leader.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // 2. Status
    if (filters.status !== 'ALL' && s.status !== filters.status) return false;

    // 3. Payment Method
    if (filters.paymentMethod !== 'ALL' && s.paymentMethod !== filters.paymentMethod) return false;

    // 4. Gender
    if (filters.gender !== 'ALL' && s.gender !== filters.gender) return false;

    // 5. Custom Age (minAge e maxAge)
    if (filters.minAge && filters.minAge.trim() !== '') {
      const min = parseInt(filters.minAge, 10);
      if (!isNaN(min) && s.age < min) return false;
    }
    if (filters.maxAge && filters.maxAge.trim() !== '') {
      const max = parseInt(filters.maxAge, 10);
      if (!isNaN(max) && s.age > max) return false;
    }

    // 6. Marital Status
    if (filters.maritalStatus !== 'ALL' && s.maritalStatus !== filters.maritalStatus) return false;

    // 7. Shirt Size
    if (filters.shirtSize !== 'ALL' && s.shirtSize !== filters.shirtSize) return false;

    // 8. Comorbidity
    if (filters.comorbidity !== 'ALL') {
      const hasComorbidity =
        s.comorbidity &&
        s.comorbidity.toLowerCase() !== 'não' &&
        s.comorbidity.toLowerCase() !== 'nao' &&
        s.comorbidity !== '—';
      if (filters.comorbidity === 'SIM' && !hasComorbidity) return false;
      if (filters.comorbidity === 'NAO' && hasComorbidity) return false;
    }

    // 9. Leadership Hierarchy
    if (filters.pastor !== 'ALL' && s.pastor !== filters.pastor) return false;
    if (filters.g12 !== 'ALL' && s.g12 !== filters.g12) return false;
    if (filters.leader !== 'ALL' && s.leader !== filters.leader) return false;

    return true;
  });
}

/** Ordena por nome (pt-BR), ignorando acentos/maiúsculas — usado na listagem, relatórios e fichas impressas. */
export function sortStudentsByName(students: StudentRecord[]): StudentRecord[] {
  return sortByName(students, (s) => s.name);
}
