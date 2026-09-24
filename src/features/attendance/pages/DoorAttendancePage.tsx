import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStudentStore } from '@/features/registrations/store/studentStore';
import { DoorAttendanceCard } from '../components/DoorAttendanceCard';
import { AttendanceConfirmModal } from '../components/AttendanceConfirmModal';
import { WeekNumber, WeekKey } from '../types';
import { Search, X, CheckCircle2 } from 'lucide-react';

const WEEKS: WeekNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export function DoorAttendancePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { students, setAttendance } = useStudentStore();

  // Read initial week from query params (?semana=X) or default to 2
  const initialWeek = useMemo<WeekNumber>(() => {
    const param = searchParams.get('semana');
    const parsed = param ? parseInt(param, 10) : 2;
    return WEEKS.includes(parsed as WeekNumber) ? (parsed as WeekNumber) : 2;
  }, [searchParams]);

  const [activeWeek, setActiveWeek] = useState<WeekNumber>(initialWeek);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'PRESENTE' | 'FALTA'>('ALL');

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    student: (typeof students)[0] | null;
    action: 'PRESENTE' | 'FALTA' | null;
  }>({
    isOpen: false,
    student: null,
    action: null,
  });

  // Success toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentKey = `s${activeWeek}` as WeekKey;

  // Filter students by active week, search query and status filter
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.pastor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.g12.toLowerCase().includes(searchQuery.toLowerCase());

      const isPresent = Boolean(s[currentKey]);
      const matchesStatus =
        filterType === 'ALL' ||
        (filterType === 'PRESENTE' && isPresent) ||
        (filterType === 'FALTA' && !isPresent);

      return matchesSearch && matchesStatus;
    });
  }, [students, searchQuery, filterType, currentKey]);

  // Counts for the active week
  const presentCount = useMemo(
    () => students.filter((s) => Boolean(s[currentKey])).length,
    [students, currentKey]
  );
  const absentCount = students.length - presentCount;

  // Update query params when week changes
  const handleSelectWeek = (week: WeekNumber) => {
    setActiveWeek(week);
    setSearchParams({ semana: String(week) });
  };

  const handleOpenConfirm = (
    student: (typeof students)[0],
    action: 'PRESENTE' | 'FALTA'
  ) => {
    setConfirmModal({
      isOpen: true,
      student,
      action,
    });
  };

  const handleConfirmAction = () => {
    if (!confirmModal.student || !confirmModal.action) return;

    const isPresent = confirmModal.action === 'PRESENTE';
    const studentName = confirmModal.student.name;

    // Persist in local store
    setAttendance(confirmModal.student.id, activeWeek, isPresent);

    // Show temporary feedback toast
    setToastMessage(
      isPresent
        ? `✓ Presença confirmada para ${studentName}`
        : `✕ Falta registrada para ${studentName}`
    );

    setConfirmModal({ isOpen: false, student: null, action: null });
  };

  // Auto-dismiss toast
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Fixed Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#58bc75] block">
                Portaria & Recepção
              </span>
              <h1 className="text-base font-black text-slate-900 leading-tight">
                Universidade da Vida
              </h1>
            </div>

            {/* Week Selector Dropdown / Badge */}
            <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl p-1 border border-slate-200/60">
              <span className="text-[10px] font-bold text-slate-500 pl-1.5">Semana:</span>
              <select
                value={activeWeek}
                onChange={(e) => handleSelectWeek(parseInt(e.target.value, 10) as WeekNumber)}
                className="text-xs font-black bg-white rounded-lg px-2 py-1 text-slate-800 border-none shadow-2xs focus:ring-2 focus:ring-[#58bc75] cursor-pointer"
              >
                {WEEKS.map((w) => (
                  <option key={w} value={w}>
                    S{w}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-center">
            <div className="bg-slate-50 border border-slate-200/60 rounded-xl py-1.5 px-2">
              <span className="text-[10px] text-slate-400 font-bold block">Inscritos</span>
              <span className="text-sm font-black text-slate-800">{students.length}</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200/60 rounded-xl py-1.5 px-2">
              <span className="text-[10px] text-emerald-600 font-bold block">Presentes</span>
              <span className="text-sm font-black text-emerald-700">{presentCount}</span>
            </div>
            <div className="bg-rose-50 border border-rose-200/60 rounded-xl py-1.5 px-2">
              <span className="text-[10px] text-rose-600 font-bold block">Faltando</span>
              <span className="text-sm font-black text-rose-700">{absentCount}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-lg mx-auto px-4 pt-4 space-y-3">
        {/* Prominent Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar aluno por nome..."
            autoFocus
            className="w-full pl-11 pr-10 py-3 text-sm bg-white border-2 border-slate-200/90 rounded-2xl focus:outline-none focus:border-[#58bc75] focus:ring-4 focus:ring-[#58bc75]/10 shadow-xs transition-all text-slate-900 placeholder:text-slate-400 font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              aria-label="Limpar busca"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
              filterType === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Todos ({students.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('PRESENTE')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
              filterType === 'PRESENTE'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200/70 hover:bg-emerald-100'
            }`}
          >
            Presentes ({presentCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('FALTA')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
              filterType === 'FALTA'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 border border-rose-200/70 hover:bg-rose-100'
            }`}
          >
            Faltas ({absentCount})
          </button>
        </div>

        {/* Student Cards List */}
        <div className="space-y-2.5 pt-1">
          {filteredStudents.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-400 text-sm space-y-1">
              <p className="font-bold text-slate-700">Nenhum aluno encontrado</p>
              <p className="text-xs">Tente buscar por outro termo ou limpe o filtro.</p>
            </div>
          ) : (
            filteredStudents.map((student) => (
              <DoorAttendanceCard
                key={student.id}
                student={student}
                activeWeek={activeWeek}
                onSelectAction={handleOpenConfirm}
              />
            ))
          )}
        </div>
      </main>

      {/* Confirmation Modal */}
      <AttendanceConfirmModal
        isOpen={confirmModal.isOpen}
        student={confirmModal.student}
        week={activeWeek}
        action={confirmModal.action}
        onConfirm={handleConfirmAction}
        onClose={() => setConfirmModal({ isOpen: false, student: null, action: null })}
      />

      {/* Floating Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs font-black py-2.5 px-5 rounded-full shadow-xl backdrop-blur-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-150">
          <CheckCircle2 className="w-4 h-4 text-[#58bc75]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
