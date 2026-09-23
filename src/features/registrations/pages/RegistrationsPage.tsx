import { useState, useMemo, useCallback } from 'react';
import { useStudentStore } from '../store/studentStore';
import { useCohortStore } from '@/features/cohorts/store/cohortStore';
import { StudentCard } from '../components/StudentCard';
import { RegistrationEditModal } from '../components/RegistrationEditModal';
import { RegistrationFilterBar } from '../components/RegistrationFilterBar';
import { RegistrationReportModal } from '../components/RegistrationReportModal';
import { StudentRecord, RegistrationFilterState, initialRegistrationFilterState } from '../types';
import { UserPlus, Users } from 'lucide-react';

export function RegistrationsPage() {
  const { activeCohortId, getActiveCohort } = useCohortStore();
  const activeCohort = getActiveCohort();

  const { students, updateStudent, addStudent } = useStudentStore();

  const cohortStudents = useMemo(() => {
    return students.filter((s) => (s.cohortId || 'turma-01') === activeCohortId);
  }, [students, activeCohortId]);

  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Unified Filter State
  const [filters, setFilters] = useState<RegistrationFilterState>(initialRegistrationFilterState);

  const handleFilterChange = useCallback(
    <K extends keyof RegistrationFilterState>(key: K, value: RegistrationFilterState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleResetFilters = useCallback(() => {
    setFilters(initialRegistrationFilterState);
  }, []);

  // Filter application
  const filteredStudents = useMemo(() => {
    return cohortStudents.filter((s) => {
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
  }, [cohortStudents, filters]);

  const paidCount = useMemo(() => cohortStudents.filter((s) => s.status === 'Pago').length, [cohortStudents]);
  const pendingCount = cohortStudents.length - paidCount;

  const handleOpenEdit = (student: StudentRecord) => {
    setEditingStudent(student);
    setIsEditModalOpen(true);
  };

  const handleOpenCreate = () => {
    const blankStudent: StudentRecord = {
      id: '',
      cohortId: activeCohortId,
      personId: '',
      num: students.length + 1,
      name: '',
      gender: 'Feminino',
      birthDate: '2000-01-01',
      age: 26,
      maritalStatus: 'Solteiro',
      phone: '',
      address: '',
      shirtSize: '—',
      pastor: filters.pastor !== 'ALL' ? filters.pastor : 'Pra. Socorro Paiva',
      g12: filters.g12 !== 'ALL' ? filters.g12 : '',
      leader: filters.leader !== 'ALL' ? filters.leader : '',
      status: 'Pendente',
      paymentMethod: '—',
      amountCents: activeCohort.registrationFeeCents || 20000,
      comorbidity: 'Não',
      medSchedule: 'Não',
      s1: false, s2: false, s3: false, s4: false, s5: false, s6: false, s7: false, s8: false, s9: false,
    };

    setEditingStudent(blankStudent);
    setIsEditModalOpen(true);
  };

  const handleSaveStudent = (s: StudentRecord) => (!s.id ? addStudent(s) : updateStudent(s));

  return (
    <div className="space-y-6">
      {/* Header & Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
            <span>Portal</span>
            <span>&gt;</span>
            <span className="text-slate-600 font-semibold">Inscrições</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Lista de Alunos ({cohortStudents.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerenciamento de alunos e inscrições da {activeCohort.name}
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-[#58bc75] hover:bg-[#4caa68] active:bg-[#419a5c] text-white transition-colors shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Novo Aluno</span>
        </button>
      </div>

      {/* Advanced Filter Bar with Export PDF */}
      <RegistrationFilterBar
        students={cohortStudents}
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        totalCohortCount={cohortStudents.length}
        paidCount={paidCount}
        pendingCount={pendingCount}
      />

      {/* Result Count Status */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-500 font-medium">
        <span>
          Exibindo <strong>{filteredStudents.length}</strong> de {cohortStudents.length} alunos na {activeCohort.name}
        </span>
      </div>

      {/* Cards List */}
      <div className="space-y-3">
        {cohortStudents.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-[28px] border border-slate-200 text-slate-500 space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#58bc75]/15 text-[#20693a] flex items-center justify-center mx-auto">
              <Users className="w-5 h-5" />
            </div>
            <div className="font-bold text-slate-800 text-sm">Nenhum aluno inscrito na {activeCohort.name}</div>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Turma iniciada do zero. Clique em "Novo Aluno" para cadastrar a primeira inscrição.
            </p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-[28px] border border-slate-200 text-slate-400">
            Nenhum aluno encontrado para os filtros selecionados.
          </div>
        ) : (
          filteredStudents.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onEdit={handleOpenEdit}
            />
          ))
        )}
      </div>

      {/* Edit Modal */}
      <RegistrationEditModal
        student={editingStudent}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveStudent}
      />

      {/* PDF / A4 Print Report Modal */}
      <RegistrationReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        students={filteredStudents}
        cohortName={activeCohort.name}
        filters={filters}
      />
    </div>
  );
}
