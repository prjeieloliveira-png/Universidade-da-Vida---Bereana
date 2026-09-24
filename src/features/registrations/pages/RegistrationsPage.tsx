import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useStudentStore } from '../store/studentStore';
import { useCohortStore } from '@/features/cohorts/store/cohortStore';
import { useActiveEdition } from '@/shared/hooks/useActiveEdition';
import { fetchCashSummary, fetchRegistrationPaymentStatuses } from '@/features/financial/data/financialData';
import { filterStudents } from '../utils/studentFilter';
import { StudentCard } from '../components/StudentCard';
import { RegistrationEditModal } from '../components/RegistrationEditModal';
import { RegistrationFilterBar } from '../components/RegistrationFilterBar';
import { RegistrationReportModal } from '../components/RegistrationReportModal';
import { StudentIndividualPrintModal } from '../components/StudentIndividualPrintModal';
import { StudentBatchPrintModal } from '../components/StudentBatchPrintModal';
import { StudentRecord, RegistrationFilterState, initialRegistrationFilterState } from '../types';
import type { RegistrationPaymentStatusRow } from '@/features/financial/types';
import { UserPlus, Users } from 'lucide-react';

export function RegistrationsPage() {
  const { activeCohortId, getActiveCohort } = useCohortStore();
  const activeCohort = getActiveCohort();

  const { students, updateStudent, addStudent } = useStudentStore();
  const { data: activeEdition } = useActiveEdition();
  const editionId = activeEdition?.id ?? '';

  // 1. Dados financeiros do Supabase
  const { data: cashSummary } = useQuery({
    queryKey: ['cash-summary', editionId],
    queryFn: () => fetchCashSummary(editionId),
    enabled: !!editionId,
    staleTime: 30_000,
  });

  const { data: paymentStatuses } = useQuery({
    queryKey: ['registration-payment-statuses', editionId],
    queryFn: () => fetchRegistrationPaymentStatuses(editionId),
    enabled: !!editionId,
    staleTime: 30_000,
  });

  const paymentStatusMap = useMemo(() => {
    const map = new Map<string, RegistrationPaymentStatusRow>();
    paymentStatuses?.forEach((status) => {
      map.set(status.registration_id, status);
      if (status.person_id) {
        map.set(status.person_id, status);
      }
    });
    return map;
  }, [paymentStatuses]);

  const cohortStudents = useMemo(() => {
    return students.filter((s) => (s.cohortId || 'turma-01') === activeCohortId);
  }, [students, activeCohortId]);

  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isPrintAllModalOpen, setIsPrintAllModalOpen] = useState(false);
  const [printingStudent, setPrintingStudent] = useState<StudentRecord | null>(null);

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

  const filteredStudents = useMemo(() => {
    return filterStudents(cohortStudents, filters);
  }, [cohortStudents, filters]);

  // Contadores com fallback resiliente
  const localPaid = useMemo(() => cohortStudents.filter((s) => s.status === 'Pago').length, [cohortStudents]);
  const localPending = cohortStudents.length - localPaid;

  const paidCount = cashSummary && cashSummary.total_registrations > 0
    ? cashSummary.paid_count
    : localPaid;

  const pendingCount = cashSummary && cashSummary.total_registrations > 0
    ? (cashSummary.pending_count + cashSummary.partial_count)
    : localPending;

  const handleOpenEdit = (student: StudentRecord) => {
    setEditingStudent(student);
    setIsEditModalOpen(true);
  };

  const handleOpenPrint = (student: StudentRecord) => {
    setPrintingStudent(student);
    setIsPrintModalOpen(true);
  };

  const handleOpenPrintAll = () => {
    setIsPrintAllModalOpen(true);
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
        onPrintAll={handleOpenPrintAll}
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
          filteredStudents.map((student) => {
            const pStatus = paymentStatusMap.get(student.id) || paymentStatusMap.get(student.personId);
            return (
              <StudentCard
                key={student.id}
                student={student}
                paymentStatus={pStatus}
                onEdit={handleOpenEdit}
                onPrint={handleOpenPrint}
              />
            );
          })
        )}
      </div>

      {/* Modals */}
      {isEditModalOpen && (
        <RegistrationEditModal
          student={editingStudent}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveStudent}
        />
      )}

      {isReportModalOpen && (
        <RegistrationReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          students={filteredStudents}
          cohortName={activeCohort.name}
          filters={filters}
        />
      )}

      {isPrintModalOpen && printingStudent && (
        <StudentIndividualPrintModal
          isOpen={isPrintModalOpen}
          onClose={() => {
            setIsPrintModalOpen(false);
            setPrintingStudent(null);
          }}
          student={printingStudent}
          cohortName={activeCohort.name}
        />
      )}

      {isPrintAllModalOpen && (
        <StudentBatchPrintModal
          isOpen={isPrintAllModalOpen}
          onClose={() => setIsPrintAllModalOpen(false)}
          students={filteredStudents}
          cohortName={activeCohort.name}
        />
      )}
    </div>
  );
}
