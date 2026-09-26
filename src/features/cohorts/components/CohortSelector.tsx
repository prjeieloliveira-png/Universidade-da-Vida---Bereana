import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Plus, Check, Calendar, Users } from 'lucide-react';
import { useCohortStore } from '../store/cohortStore';
import { useStudentStore } from '@/features/registrations/store/studentStore';
import { NewCohortModal } from './NewCohortModal';

export function CohortSelector() {
  const { cohorts, activeCohortId, setActiveCohort, getActiveCohort } = useCohortStore();
  const { students } = useStudentStore();

  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeCohort = getActiveCohort();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Counts per cohort
  const cohortStudentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach((s) => {
      const cId = s.cohortId || 'turma-01';
      counts[cId] = (counts[cId] || 0) + 1;
    });
    return counts;
  }, [students]);

  const activeCount = cohortStudentCounts[activeCohort.id] || 0;

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Trigger Pill Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 sm:px-3.5 py-1.5 bg-white/90 hover:bg-white border border-slate-200/80 rounded-full shadow-2xs text-xs font-bold text-slate-800 transition-all cursor-pointer active:scale-95"
          aria-label="Selecionar Turma"
        >
          <div className="w-5 h-5 flex items-center justify-center shrink-0">
            <img src="/logo-uv-mark.png" alt="UV" className="w-4 h-4 object-contain" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="truncate max-w-[110px] sm:max-w-[150px] font-extrabold text-slate-900">
              {activeCohort.name}
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.2 text-[10px] rounded-full bg-slate-100 text-slate-600 font-semibold">
              {activeCount} alunos
            </span>
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-2 w-72 sm:w-80 bg-white border border-slate-200 rounded-3xl shadow-xl z-50 p-2.5 space-y-2 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">
                Turmas & Edições
              </span>
              <span className="text-[11px] font-bold text-slate-400">
                {cohorts.length} {cohorts.length === 1 ? 'turma' : 'turmas'}
              </span>
            </div>

            {/* Cohorts List */}
            <div className="space-y-1 max-h-60 overflow-y-auto pr-0.5">
              {cohorts.map((cohort) => {
                const isCurrent = cohort.id === activeCohortId;
                const count = cohortStudentCounts[cohort.id] || 0;

                return (
                  <button
                    key={cohort.id}
                    type="button"
                    onClick={() => {
                      setActiveCohort(cohort.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-2xl flex items-center justify-between transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-[#e8f8ee] border border-[#c4e3d0] text-slate-900'
                        : 'hover:bg-slate-50 border border-transparent text-slate-700'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs truncate">{cohort.name}</span>
                        {isCurrent && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-[#58bc75] text-white">
                            Ativa
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {count} alunos
                        </span>
                        {cohort.startDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {cohort.startDate.split('-')[0]}
                          </span>
                        )}
                      </div>
                    </div>

                    {isCurrent && (
                      <div className="w-6 h-6 rounded-full bg-[#58bc75] text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom New Cohort Action */}
            <div className="pt-1.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsModalOpen(true);
                }}
                className="w-full py-2 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Cadastrar Nova Turma</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Cohort Modal */}
      <NewCohortModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
