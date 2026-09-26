import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRegistrations } from '../hooks/useRegistrations';
import { useCohortStore } from '@/features/cohorts/store/cohortStore';
import { useActiveEdition } from '@/shared/hooks/useActiveEdition';
import { fetchCashSummary, fetchRegistrationPaymentStatuses } from '@/features/financial/data/financialData';
import { filterStudents } from '../utils/studentFilter';
import { isPaidPaymentStatus } from '../api/registrationsApi';
import { StudentCard } from '../components/StudentCard';
import { RegistrationEditModal } from '../components/RegistrationEditModal';
import { DeleteRegistrationDialog } from '../components/DeleteRegistrationDialog';
import { useUserRole } from '@/shared/hooks/useUserRole';
import { RegistrationFilterBar } from '../components/RegistrationFilterBar';
import { RegistrationReportModal } from '../components/RegistrationReportModal';
import { StudentIndividualPrintModal } from '../components/StudentIndividualPrintModal';
import { StudentBatchPrintModal } from '../components/StudentBatchPrintModal';
import { StudentRecord, RegistrationFilterState, initialRegistrationFilterState } from '../types';
import type { RegistrationPaymentStatusRow } from '@/features/financial/types';
import { UserPlus, Users, CloudUpload, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';

export function RegistrationsPage() {
  const { activeCohortId, getActiveCohort } = useCohortStore();
  const activeCohort = getActiveCohort();

  const { data: activeEdition } = useActiveEdition();
  const editionId = activeEdition?.id ?? '';

  const {
    students,
    isLoadingStudents,
    isRefetchingStudents,
    refetchStudents,
    isSaving,
    saveStudent,
    isSyncing,
    syncAllStudents,
  } = useRegistrations({ editionId });

  const { role } = useUserRole();
  const canDeleteStudents = role === 'coordinator' || role === 'secretary';
  const [deletingStudent, setDeletingStudent] = useState<StudentRecord | null>(null);

  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);

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

  // O status vem da view de pagamentos (mesma fonte do badge e dos contadores),
  // pois a lista local pode estar desatualizada em relação aos pagamentos.
  const cohortStudents = useMemo(() => {
    return students
      .filter((s) => (s.cohortId || 'turma-01') === activeCohortId)
      .map((s) => {
        const pStatus = paymentStatusMap.get(s.id) || paymentStatusMap.get(s.personId);
        if (!pStatus) return s;
        const status: StudentRecord['status'] = isPaidPaymentStatus(pStatus.status) ? 'Pago' : 'Pendente';
        return status === s.status ? s : { ...s, status };
      });
  }, [students, activeCohortId, paymentStatusMap]);

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

  const handleSaveStudent = async (s: StudentRecord) => {
    await saveStudent(s);
  };

  const handleSyncCloud = async () => {
    try {
      const res = await syncAllStudents(cohortStudents);
      setSyncSuccessMessage(`${res.synced} alunos sincronizados com o Supabase com sucesso!`);
      setTimeout(() => setSyncSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Falha ao sincronizar com a nuvem:', err);
    }
  };

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

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => void refetchStudents()}
            disabled={isLoadingStudents || isRefetchingStudents}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            title="Atualizar lista com dados em tempo real do Supabase"
            aria-label="Atualizar lista com dados do Supabase"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingStudents || isRefetchingStudents ? 'animate-spin text-[#0d7647]' : ''}`} />
          </button>

          <button
            onClick={handleSyncCloud}
            disabled={isSyncing || cohortStudents.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 transition-colors shadow-2xs cursor-pointer"
            title="Sincronizar todos os alunos desta turma com o banco de dados do Supabase"
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#0d7647]" />
                <span>Sincronizando...</span>
              </>
            ) : (
              <>
                <CloudUpload className="w-4 h-4 text-[#0d7647]" />
                <span>Sincronizar Nuvem</span>
              </>
            )}
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-[#58bc75] hover:bg-[#4caa68] active:bg-[#419a5c] text-white transition-colors shadow-sm cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Novo Aluno</span>
          </button>
        </div>
      </div>

      {syncSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-semibold text-emerald-800 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{syncSuccessMessage}</span>
        </div>
      )}

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
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingStudent(null);
          }}
          onSave={handleSaveStudent}
          isSaving={isSaving}
          onDelete={canDeleteStudents ? () => setDeletingStudent(editingStudent) : undefined}
        />
      )}

      {deletingStudent && (
        <DeleteRegistrationDialog
          student={deletingStudent}
          paymentStatus={paymentStatusMap.get(deletingStudent.id) || paymentStatusMap.get(deletingStudent.personId)}
          editionId={editionId}
          onClose={() => setDeletingStudent(null)}
          onDeleted={() => {
            setDeletingStudent(null);
            setIsEditModalOpen(false);
            setEditingStudent(null);
          }}
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
