import type { StudentRecord, RegistrationFilterState } from '../types';

export function filterStudents(
  students: StudentRecord[],
  filters: RegistrationFilterState
): StudentRecord[] {
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

    // 5. Age Range
    if (filters.ageRange !== 'ALL') {
      if (filters.ageRange === 'under18' && s.age >= 18) return false;
      if (filters.ageRange === '18-29' && (s.age < 18 || s.age > 29)) return false;
      if (filters.ageRange === '30-49' && (s.age < 30 || s.age > 49)) return false;
      if (filters.ageRange === '50+' && s.age < 50) return false;
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
