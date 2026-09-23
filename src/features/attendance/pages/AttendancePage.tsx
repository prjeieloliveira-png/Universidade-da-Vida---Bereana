import { useState, useMemo } from 'react';
import { useStudentStore } from '@/features/registrations/store/studentStore';
import { useCohortStore } from '@/features/cohorts/store/cohortStore';
import { WeekSelectorPills } from '../components/WeekSelectorPills';
import { AttendanceStatsBar } from '../components/AttendanceStatsBar';
import { AttendanceStudentRow } from '../components/AttendanceStudentRow';
import { AttendanceReportModal } from '../components/AttendanceReportModal';
import { HierarchicalLeaderFilter } from '@/features/registrations/components/HierarchicalLeaderFilter';
import { WeekNumber, WeekKey } from '../types';
import { Search, FileSpreadsheet } from 'lucide-react';

export function AttendancePage() {
  const { students, toggleAttendance, setBulkAttendance } = useStudentStore();
  const { activeCohortId, getActiveCohort } = useCohortStore();
  const activeCohort = getActiveCohort();

  const cohortStudents = useMemo(() => {
    return students.filter((s) => (s.cohortId || 'turma-01') === activeCohortId);
  }, [students, activeCohortId]);

  const [activeWeek, setActiveWeek] = useState<WeekNumber>(2); // Default to Week 2 which was in progress in PDF
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PRESENTE' | 'FALTA'>('ALL');
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Hierarchical leadership filter
  const [selectedPastor, setSelectedPastor] = useState<string>('ALL');
  const [selectedG12, setSelectedG12] = useState<string>('ALL');
  const [selectedLeader, setSelectedLeader] = useState<string>('ALL');

  const currentKey = `s${activeWeek}` as WeekKey;

  // Filter logic
  const filteredStudents = useMemo(() => {
    return cohortStudents.filter((s) => {
      // 1. Text Search
      const matchesSearch =
        searchQuery.trim() === '' ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.pastor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.g12.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.leader.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Presence Status Filter in Active Week
      const isPresent = Boolean(s[currentKey]);
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'PRESENTE' && isPresent) ||
        (statusFilter === 'FALTA' && !isPresent);

      // 3. Leadership Hierarchy
      const matchesPastor = selectedPastor === 'ALL' || s.pastor === selectedPastor;
      const matchesG12 = selectedG12 === 'ALL' || s.g12 === selectedG12;
      const matchesLeader = selectedLeader === 'ALL' || s.leader === selectedLeader;

      return matchesSearch && matchesStatus && matchesPastor && matchesG12 && matchesLeader;
    });
  }, [cohortStudents, searchQuery, statusFilter, currentKey, selectedPastor, selectedG12, selectedLeader]);

  // Metrics for active week based on filtered scope
  const presentCount = useMemo(
    () => filteredStudents.filter((s) => Boolean(s[currentKey])).length,
    [filteredStudents, currentKey]
  );
  const absentCount = filteredStudents.length - presentCount;

  const handleMarkAllPresent = () => {
    const ids = filteredStudents.map((s) => s.id);
    setBulkAttendance(ids, activeWeek, true);
  };

  const handleResetHierarchy = () => {
    setSelectedPastor('ALL');
    setSelectedG12('ALL');
    setSelectedLeader('ALL');
  };

  // Active filter description for report
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

        {/* Quick Report Trigger */}
        <button
          onClick={() => setIsReportOpen(true)}
          className="self-start sm:self-auto px-4 py-2.5 rounded-full text-xs font-black bg-[#163242] hover:bg-[#1f4358] active:bg-[#122835] text-white flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
        >
          <FileSpreadsheet className="w-4 h-4 text-[#58bc75]" />
          <span>Relatório de Chamadas</span>
        </button>
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
          {/* Search Input */}
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

          {/* Quick Presence Status Filter */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
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

        {/* Hierarchical Leadership Filter */}
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
              onToggle={toggleAttendance}
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
    </div>
  );
}

