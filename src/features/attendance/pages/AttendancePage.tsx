import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useStudentStore } from '@/features/registrations/store/studentStore';
import { useCohortStore } from '@/features/cohorts/store/cohortStore';
import { useActiveEdition } from '@/shared/hooks/useActiveEdition';
import { WeekSelectorPills } from '../components/WeekSelectorPills';
import { AttendanceStatsBar } from '../components/AttendanceStatsBar';
import { AttendanceStudentRow } from '../components/AttendanceStudentRow';
import { AttendanceReportModal } from '../components/AttendanceReportModal';
import { ShareDoorLinkModal } from '../components/ShareDoorLinkModal';
import { AttendanceSyncBadge } from '../components/AttendanceSyncBadge';
import { AttendanceConfirmModal } from '../components/AttendanceConfirmModal';
import { useAttendanceSync } from '../hooks/useAttendanceSync';
import { fetchAbsenceCounts, fetchAttendanceLog } from '../api/attendanceApi';
import { RegistrationAdvancedFiltersDrawer } from '@/features/registrations/components/RegistrationAdvancedFiltersDrawer';
import { filterStudents } from '@/features/registrations/utils/studentFilter';
import {
  StudentRecord,
  RegistrationFilterState,
  initialRegistrationFilterState,
} from '@/features/registrations/types';
import { sortByName } from '@/shared/utils/sortByName';
import { WeekNumber, WeekKey } from '../types';
import { Search, FileSpreadsheet, Smartphone, ArrowDownAZ, SlidersHorizontal, X } from 'lucide-react';

export function AttendancePage() {
  const { students } = useStudentStore();
  const { activeCohortId, getActiveCohort } = useCohortStore();
  const activeCohort = getActiveCohort();
  const {
    syncStatus,
    pendingCount,
    flushQueue,
    markAttendance,
  } = useAttendanceSync();

  const cohortStudents = useMemo(() => {
    return students.filter((s) => (s.cohortId || 'turma-01') === activeCohortId);
  }, [students, activeCohortId]);

  // Faltas: contagem real do Supabase, só usada aqui (Chamada), não em Inscrições
  const { data: activeEdition } = useActiveEdition();
  const editionId = activeEdition?.id ?? '';
  const { data: absenceCounts } = useQuery({
    queryKey: ['registration-absence-counts', editionId],
    queryFn: () => fetchAbsenceCounts(editionId),
    enabled: !!editionId,
    staleTime: 30_000,
  });

  const absenceCountMap = useMemo(() => {
    const map = new Map<string, number>();
    absenceCounts?.forEach((row) => map.set(row.registration_id, row.absence_count));
    return map;
  }, [absenceCounts]);

  // Semanas com falta de fato registrada no Supabase (distingue de "ainda não registrada")
  const registrationIds = useMemo(() => cohortStudents.map((s) => s.id), [cohortStudents]);
  const { data: attendanceLog } = useQuery({
    queryKey: ['attendance-log', registrationIds],
    queryFn: () => fetchAttendanceLog(registrationIds),
    enabled: registrationIds.length > 0,
    staleTime: 30_000,
  });

  // Marcações de falta confirmadas nesta sessão, antes mesmo de o Supabase ter sincronizado
  const [optimisticFalta, setOptimisticFalta] = useState<Set<string>>(new Set());

  const recordedAbsentWeeksByStudent = useMemo(() => {
    const map = new Map<string, Set<number>>();
    attendanceLog?.forEach((entry) => {
      if (entry.present) return;
      if (!map.has(entry.registration_id)) map.set(entry.registration_id, new Set());
      map.get(entry.registration_id)!.add(entry.session_number);
    });
    optimisticFalta.forEach((key) => {
      const [studentId, weekStr] = key.split(':');
      if (!studentId || !weekStr) return;
      if (!map.has(studentId)) map.set(studentId, new Set());
      map.get(studentId)!.add(Number(weekStr));
    });
    return map;
  }, [attendanceLog, optimisticFalta]);

  const [activeWeek, setActiveWeek] = useState<WeekNumber>(2);
  const [weekSelected, setWeekSelected] = useState(false);
  const [filters, setFilters] = useState<RegistrationFilterState>(initialRegistrationFilterState);
  const [isFiltersDrawerOpen, setIsFiltersDrawerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PRESENTE' | 'FALTA'>('ALL');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    student: StudentRecord | null;
    action: 'PRESENTE' | 'FALTA' | null;
  }>({ isOpen: false, student: null, action: null });

  const [sortAlphabetically, setSortAlphabetically] = useState(false);

  const handleFilterChange = <K extends keyof RegistrationFilterState>(
    key: K,
    value: RegistrationFilterState[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => setFilters(initialRegistrationFilterState);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.status !== 'ALL') count++;
    if (filters.paymentMethod !== 'ALL') count++;
    if (filters.gender !== 'ALL') count++;
    if (filters.ageRange !== 'ALL') count++;
    if (filters.maritalStatus !== 'ALL') count++;
    if (filters.shirtSize !== 'ALL') count++;
    if (filters.comorbidity !== 'ALL') count++;
    if (filters.pastor !== 'ALL') count++;
    if (filters.g12 !== 'ALL') count++;
    if (filters.leader !== 'ALL') count++;
    return count;
  }, [filters]);

  const activeChips = useMemo(() => {
    const list: { key: keyof RegistrationFilterState; label: string; value: string }[] = [];
    if (filters.status !== 'ALL') list.push({ key: 'status', label: 'Pagamento', value: filters.status });
    if (filters.gender !== 'ALL') list.push({ key: 'gender', label: 'Sexo', value: filters.gender });
    if (filters.ageRange !== 'ALL') {
      const val = filters.ageRange === 'under18' ? '<18' : filters.ageRange;
      list.push({ key: 'ageRange', label: 'Idade', value: val });
    }
    if (filters.maritalStatus !== 'ALL') list.push({ key: 'maritalStatus', label: 'Est. Civil', value: filters.maritalStatus });
    if (filters.paymentMethod !== 'ALL') list.push({ key: 'paymentMethod', label: 'Forma Pgto', value: filters.paymentMethod });
    if (filters.shirtSize !== 'ALL') list.push({ key: 'shirtSize', label: 'Camiseta', value: filters.shirtSize });
    if (filters.pastor !== 'ALL') list.push({ key: 'pastor', label: 'Pastor', value: filters.pastor });
    if (filters.g12 !== 'ALL') list.push({ key: 'g12', label: 'G12', value: filters.g12 });
    if (filters.leader !== 'ALL') list.push({ key: 'leader', label: 'Líder', value: filters.leader });
    if (filters.comorbidity !== 'ALL') {
      list.push({ key: 'comorbidity', label: 'Saúde', value: filters.comorbidity === 'SIM' ? 'Com restrição' : 'Sem restrição' });
    }
    return list;
  }, [filters]);

  const currentKey = `s${activeWeek}` as WeekKey;

  const filteredStudents = useMemo(() => {
    const base = filterStudents(cohortStudents, filters);
    const filtered = base.filter((s) => {
      const isPresent = Boolean(s[currentKey]);
      return (
        statusFilter === 'ALL' ||
        (statusFilter === 'PRESENTE' && isPresent) ||
        (statusFilter === 'FALTA' && !isPresent)
      );
    });
    return sortAlphabetically ? sortByName(filtered, (s) => s.name) : filtered;
  }, [cohortStudents, filters, statusFilter, currentKey, sortAlphabetically]);

  const presentCount = useMemo(
    () => filteredStudents.filter((s) => Boolean(s[currentKey])).length,
    [filteredStudents, currentKey]
  );
  const absentCount = filteredStudents.length - presentCount;

  const handleSelectWeek = (week: WeekNumber) => {
    setActiveWeek(week);
    setWeekSelected(true);
  };

  const handleSelectAction = (student: StudentRecord, action: 'PRESENTE' | 'FALTA') => {
    if (!weekSelected) return;
    setConfirmModal({ isOpen: true, student, action });
  };

  const handleConfirmAction = (note?: string) => {
    if (!confirmModal.student || !confirmModal.action) return;
    const isPresent = confirmModal.action === 'PRESENTE';
    markAttendance(confirmModal.student, activeWeek, isPresent, note);
    if (!isPresent) {
      const key = `${confirmModal.student.id}:${activeWeek}`;
      setOptimisticFalta((prev) => new Set(prev).add(key));
    }
    setConfirmModal({ isOpen: false, student: null, action: null });
  };

  const activeFiltersDesc = useMemo(() => {
    const parts: string[] = [];
    if (filters.pastor !== 'ALL') parts.push(`Pastor: ${filters.pastor}`);
    if (filters.g12 !== 'ALL') parts.push(`G12: ${filters.g12}`);
    if (filters.leader !== 'ALL') parts.push(`Líder: ${filters.leader}`);
    if (filters.status !== 'ALL') parts.push(`Pagamento: ${filters.status}`);
    if (filters.paymentMethod !== 'ALL') parts.push(`Forma Pgto: ${filters.paymentMethod}`);
    if (filters.gender !== 'ALL') parts.push(`Sexo: ${filters.gender}`);
    if (filters.ageRange !== 'ALL') parts.push(`Idade: ${filters.ageRange}`);
    if (filters.maritalStatus !== 'ALL') parts.push(`Est. Civil: ${filters.maritalStatus}`);
    if (filters.shirtSize !== 'ALL') parts.push(`Camiseta: ${filters.shirtSize}`);
    if (filters.comorbidity !== 'ALL') {
      parts.push(`Saúde: ${filters.comorbidity === 'SIM' ? 'Com restrição' : 'Sem restrição'}`);
    }
    if (statusFilter !== 'ALL') parts.push(`Chamada: ${statusFilter === 'PRESENTE' ? 'Presentes' : 'Faltas'} na S${activeWeek}`);
    if (filters.searchQuery.trim()) parts.push(`Busca: "${filters.searchQuery.trim()}"`);
    return parts.join(' | ');
  }, [filters, statusFilter, activeWeek]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
            <span>Portal</span>
            <span>&gt;</span>
            <span className="text-slate-600 font-semibold">Chamada & Frequência</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Lista de Chamada ({students.length} Alunos)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Universidade da Vida 2026 • 9 Semanas de Encontros
          </p>
        </div>

        {/* Action Buttons & Sync Indicator */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <AttendanceSyncBadge
            status={syncStatus}
            pendingCount={pendingCount}
            onForceSync={flushQueue}
          />

          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="px-4 py-2.5 rounded-full text-xs font-black bg-[#58bc75] hover:bg-[#4caa68] active:bg-[#409a5b] text-white flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Smartphone className="w-4 h-4" />
            <span>Link da Porta</span>
          </button>

          <button
            type="button"
            onClick={() => setIsReportOpen(true)}
            className="px-4 py-2.5 rounded-full text-xs font-black bg-[#163242] hover:bg-[#1f4358] active:bg-[#122835] text-white flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#58bc75]" />
            <span>Relatório</span>
          </button>
        </div>
      </div>

      {/* Week Selector Pills */}
      <WeekSelectorPills activeWeek={activeWeek} weekSelected={weekSelected} onSelectWeek={handleSelectWeek} />

      {/* Attendance Stats Bar */}
      <AttendanceStatsBar
        totalCount={filteredStudents.length}
        presentCount={weekSelected ? presentCount : 0}
        absentCount={weekSelected ? absentCount : filteredStudents.length}
        onOpenReport={() => setIsReportOpen(true)}
      />

      {/* Busca, ordenação e filtros (mesmo conjunto de filtros de Inscrições) */}
      <div className="bg-white border border-slate-200/80 rounded-[28px] p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
              placeholder="Buscar aluno por nome, telefone, pastor ou líder..."
              className="w-full pl-11 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200/80 rounded-full focus:outline-none focus:ring-2 focus:ring-[#58bc75] focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => setSortAlphabetically((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer border ${
                sortAlphabetically
                  ? 'bg-[#163242] text-white border-[#163242]'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-transparent'
              }`}
              title={sortAlphabetically ? 'Ordenação alfabética ativada' : 'Ordenar alunos em ordem alfabética'}
              aria-pressed={sortAlphabetically}
            >
              <ArrowDownAZ className={`w-3.5 h-3.5 ${sortAlphabetically ? 'text-[#58bc75]' : 'text-slate-500'}`} />
              <span>A-Z</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFiltersDrawerOpen((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer border ${
                isFiltersDrawerOpen || activeFiltersCount > 0
                  ? 'bg-[#163242] text-white border-[#163242]'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#58bc75]" />
              <span>Mais filtros</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#58bc75] text-[#163242] text-[10px] font-black flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-[#163242] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({filteredStudents.length})
            </button>
            <button
              onClick={() => weekSelected && setStatusFilter('PRESENTE')}
              disabled={!weekSelected}
              title={weekSelected ? undefined : 'Selecione uma semana acima para filtrar por presença'}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                !weekSelected
                  ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
                  : statusFilter === 'PRESENTE'
                  ? 'bg-[#58bc75] text-white shadow-xs cursor-pointer'
                  : 'bg-[#e8f8ee] text-[#2c814b] hover:bg-[#d6f4df] cursor-pointer'
              }`}
            >
              Presentes ({weekSelected ? presentCount : 0})
            </button>
            <button
              onClick={() => weekSelected && setStatusFilter('FALTA')}
              disabled={!weekSelected}
              title={weekSelected ? undefined : 'Selecione uma semana acima para filtrar por presença'}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                !weekSelected
                  ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
                  : statusFilter === 'FALTA'
                  ? 'bg-rose-600 text-white shadow-xs cursor-pointer'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 cursor-pointer'
              }`}
            >
              Faltas ({weekSelected ? absentCount : 0})
            </button>
          </div>
        </div>

        {/* Situação de pagamento — único filtro de Inscrições fora do drawer de filtros avançados */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0">Pagamento:</span>
          <button
            onClick={() => handleFilterChange('status', 'ALL')}
            className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              filters.status === 'ALL'
                ? 'bg-[#163242] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => handleFilterChange('status', 'Pago')}
            className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              filters.status === 'Pago'
                ? 'bg-[#58bc75] text-white'
                : 'bg-[#e8f8ee] text-[#2c814b] hover:bg-[#d6f4df]'
            }`}
          >
            Pagos
          </button>
          <button
            onClick={() => handleFilterChange('status', 'Pendente')}
            className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              filters.status === 'Pendente'
                ? 'bg-amber-500 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Pendentes
          </button>
        </div>

        {/* Chips de filtros avançados ativos */}
        {activeChips.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400">Ativos:</span>
            {activeChips.map((chip) => (
              <span
                key={chip.key}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#163242]/8 text-[#163242] text-[11px] font-medium"
              >
                <span className="text-slate-400 font-normal">{chip.label}:</span>
                <strong>{chip.value}</strong>
                <button
                  onClick={() => handleFilterChange(chip.key, initialRegistrationFilterState[chip.key])}
                  className="hover:text-rose-600 transition-colors cursor-pointer ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              onClick={handleResetFilters}
              className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 hover:underline cursor-pointer ml-1"
            >
              Limpar tudo
            </button>
          </div>
        )}

        {isFiltersDrawerOpen && (
          <RegistrationAdvancedFiltersDrawer
            students={cohortStudents}
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        )}
      </div>

      {/* Student Rows List */}
      <div className="space-y-2.5">
        {cohortStudents.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-[28px] border border-slate-200 text-slate-500">
            Nenhum aluno inscrito na {activeCohort.name} para chamada.
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-[28px] border border-slate-200 text-slate-400">
            Nenhum aluno encontrado para os filtros selecionados.
          </div>
        ) : (
          filteredStudents.map((student) => (
            <AttendanceStudentRow
              key={student.id}
              student={student}
              activeWeek={activeWeek}
              weekSelected={weekSelected}
              absenceCount={absenceCountMap.get(student.id) ?? 0}
              recordedAbsentWeeks={recordedAbsentWeeksByStudent.get(student.id)}
              onSelectAction={handleSelectAction}
            />
          ))
        )}
      </div>

      {/* Attendance Full Report Modal */}
      <AttendanceReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        students={filteredStudents}
        activeFiltersDesc={activeFiltersDesc}
      />

      {/* Share Door Link Modal */}
      <ShareDoorLinkModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        activeWeek={activeWeek}
      />

      {/* Confirmação antes de aplicar Presente/Falta */}
      <AttendanceConfirmModal
        isOpen={confirmModal.isOpen}
        subjectId={confirmModal.student?.id ?? null}
        subjectName={confirmModal.student?.name ?? null}
        subjectLabel="Aluno(a) selecionado(a):"
        subjectNoun="aluno"
        contextLabel={`Aula • Semana ${activeWeek}`}
        details={
          confirmModal.student
            ? [
                { label: 'Pastor', value: confirmModal.student.pastor },
                {
                  label: 'G12 / Líder',
                  value: confirmModal.student.g12 || confirmModal.student.leader || '—',
                },
              ]
            : []
        }
        action={confirmModal.action}
        onConfirm={handleConfirmAction}
        onClose={() => setConfirmModal({ isOpen: false, student: null, action: null })}
      />
    </div>
  );
}
