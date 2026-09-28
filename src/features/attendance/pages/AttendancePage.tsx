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
import { HierarchicalLeaderFilter } from '@/features/registrations/components/HierarchicalLeaderFilter';
import type { StudentRecord } from '@/features/registrations/types';
import { sortByName } from '@/shared/utils/sortByName';
import { WeekNumber, WeekKey } from '../types';
import { Search, FileSpreadsheet, Smartphone, ArrowDownAZ } from 'lucide-react';

export function AttendancePage() {
  const { students } = useStudentStore();
  const { activeCohortId, getActiveCohort } = useCohortStore();
  const activeCohort = getActiveCohort();
  const {
    syncStatus,
    pendingCount,
    flushQueue,
    markAttendance,
    markBulkStudentsAttendance,
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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PRESENTE' | 'FALTA'>('ALL');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    student: StudentRecord | null;
    action: 'PRESENTE' | 'FALTA' | null;
  }>({ isOpen: false, student: null, action: null });

  const [selectedPastor, setSelectedPastor] = useState<string>('ALL');
  const [selectedG12, setSelectedG12] = useState<string>('ALL');
  const [selectedLeader, setSelectedLeader] = useState<string>('ALL');
  const [sortAlphabetically, setSortAlphabetically] = useState(false);

  const currentKey = `s${activeWeek}` as WeekKey;

  const filteredStudents = useMemo(() => {
    const filtered = cohortStudents.filter((s) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.pastor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.g12.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.leader.toLowerCase().includes(searchQuery.toLowerCase());

      const isPresent = Boolean(s[currentKey]);
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'PRESENTE' && isPresent) ||
        (statusFilter === 'FALTA' && !isPresent);

      const matchesPastor = selectedPastor === 'ALL' || s.pastor === selectedPastor;
      const matchesG12 = selectedG12 === 'ALL' || s.g12 === selectedG12;
      const matchesLeader = selectedLeader === 'ALL' || s.leader === selectedLeader;

      return matchesSearch && matchesStatus && matchesPastor && matchesG12 && matchesLeader;
    });
    return sortAlphabetically ? sortByName(filtered, (s) => s.name) : filtered;
  }, [cohortStudents, searchQuery, statusFilter, currentKey, selectedPastor, selectedG12, selectedLeader, sortAlphabetically]);

  const presentCount = useMemo(
    () => filteredStudents.filter((s) => Boolean(s[currentKey])).length,
    [filteredStudents, currentKey]
  );
  const absentCount = filteredStudents.length - presentCount;

  const handleMarkAllPresent = () => {
    markBulkStudentsAttendance(filteredStudents, activeWeek, true);
  };

  const handleSelectAction = (student: StudentRecord, action: 'PRESENTE' | 'FALTA') => {
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

  const handleResetHierarchy = () => {
    setSelectedPastor('ALL');
    setSelectedG12('ALL');
    setSelectedLeader('ALL');
  };

  const activeFiltersDesc = useMemo(() => {
    const parts: string[] = [];
    if (selectedPastor !== 'ALL') parts.push(`Pastor: ${selectedPastor}`);
    if (selectedG12 !== 'ALL') parts.push(`G12: ${selectedG12}`);
    if (selectedLeader !== 'ALL') parts.push(`Líder: ${selectedLeader}`);
    if (statusFilter !== 'ALL') parts.push(`Status: ${statusFilter === 'PRESENTE' ? 'Presentes' : 'Faltas'} na S${activeWeek}`);
    if (searchQuery.trim()) parts.push(`Busca: "${searchQuery.trim()}"`);
    return parts.join(' | ');
  }, [selectedPastor, selectedG12, selectedLeader, statusFilter, activeWeek, searchQuery]);

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
      <WeekSelectorPills activeWeek={activeWeek} onSelectWeek={setActiveWeek} />

      {/* Attendance Stats Bar */}
      <AttendanceStatsBar
        totalCount={filteredStudents.length}
        presentCount={presentCount}
        absentCount={absentCount}
        onMarkAllPresent={handleMarkAllPresent}
        onOpenReport={() => setIsReportOpen(true)}
      />

      {/* Search & Hierarchical Leadership Filters */}
      <div className="bg-white border border-slate-200/80 rounded-[28px] p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
              onClick={() => setStatusFilter('PRESENTE')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                statusFilter === 'PRESENTE'
                  ? 'bg-[#58bc75] text-white shadow-xs'
                  : 'bg-[#e8f8ee] text-[#2c814b] hover:bg-[#d6f4df]'
              }`}
            >
              Presentes ({presentCount})
            </button>
            <button
              onClick={() => setStatusFilter('FALTA')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                statusFilter === 'FALTA'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              Faltas ({absentCount})
            </button>
          </div>
        </div>

        <HierarchicalLeaderFilter
          students={cohortStudents}
          selectedPastor={selectedPastor}
          selectedG12={selectedG12}
          selectedLeader={selectedLeader}
          onSelectPastor={setSelectedPastor}
          onSelectG12={setSelectedG12}
          onSelectLeader={setSelectedLeader}
          onResetHierarchy={handleResetHierarchy}
        />
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
        student={confirmModal.student}
        week={activeWeek}
        action={confirmModal.action}
        onConfirm={handleConfirmAction}
        onClose={() => setConfirmModal({ isOpen: false, student: null, action: null })}
      />
    </div>
  );
}
