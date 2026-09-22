import { useMemo } from 'react';
import { UserCheck, Users, Layers, RotateCcw } from 'lucide-react';
import type { StudentRecord } from '../types';

interface HierarchicalLeaderFilterProps {
  students: StudentRecord[];
  selectedPastor: string;
  selectedG12: string;
  selectedLeader: string;
  onSelectPastor: (pastor: string) => void;
  onSelectG12: (g12: string) => void;
  onSelectLeader: (leader: string) => void;
  onResetHierarchy: () => void;
}

export function HierarchicalLeaderFilter({
  students,
  selectedPastor,
  selectedG12,
  selectedLeader,
  onSelectPastor,
  onSelectG12,
  onSelectLeader,
  onResetHierarchy,
}: HierarchicalLeaderFilterProps) {
  // 1. Available Pastors (Distinct names)
  const pastors = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.pastor) set.add(s.pastor);
    });
    return Array.from(set);
  }, [students]);

  // 2. Available G12s under selected Pastor (Distinct names)
  const g12List = useMemo(() => {
    if (selectedPastor === 'ALL') return [];
    const list = students.filter((s) => s.pastor === selectedPastor);
    const set = new Set<string>();
    list.forEach((s) => {
      if (s.g12) set.add(s.g12);
    });
    return Array.from(set);
  }, [students, selectedPastor]);

  // 3. Available Cell Leaders under selected G12 (Distinct names)
  const leadersList = useMemo(() => {
    if (selectedG12 === 'ALL') return [];
    const list = students.filter((s) => {
      const matchPastor = selectedPastor === 'ALL' || s.pastor === selectedPastor;
      return matchPastor && s.g12 === selectedG12;
    });
    const set = new Set<string>();
    list.forEach((s) => {
      if (s.leader) set.add(s.leader);
    });
    return Array.from(set);
  }, [students, selectedPastor, selectedG12]);

  const hasActiveHierarchy =
    selectedPastor !== 'ALL' || selectedG12 !== 'ALL' || selectedLeader !== 'ALL';

  return (
    <div className="pt-3 border-t border-slate-100 space-y-3">
      {/* Level 1: Pastores */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 font-bold flex items-center gap-1.5 shrink-0 uppercase text-[10px] tracking-wider">
          <UserCheck className="w-3.5 h-3.5 text-slate-500" /> Pastor:
        </span>

        <button
          onClick={() => {
            onSelectPastor('ALL');
            onSelectG12('ALL');
            onSelectLeader('ALL');
          }}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            selectedPastor === 'ALL'
              ? 'bg-[#163242] text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Todos
        </button>

        {pastors.map((pastorName) => (
          <button
            key={pastorName}
            onClick={() => {
              onSelectPastor(pastorName);
              onSelectG12('ALL');
              onSelectLeader('ALL');
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedPastor === pastorName
                ? 'bg-[#163242] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {pastorName}
          </button>
        ))}

        {hasActiveHierarchy && (
          <button
            onClick={onResetHierarchy}
            className="ml-auto inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Limpar Liderança</span>
          </button>
        )}
      </div>

      {/* Level 2: G12 do Pastor Selecionado */}
      {selectedPastor !== 'ALL' && g12List.length > 0 && (
        <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100 space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-[#58bc75]" />
            <span>G12 de {selectedPastor}</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => {
                onSelectG12('ALL');
                onSelectLeader('ALL');
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                selectedG12 === 'ALL'
                  ? 'bg-[#58bc75] text-white shadow-xs font-bold'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Todos os G12
            </button>

            {g12List.map((g12Name) => (
              <button
                key={g12Name}
                onClick={() => {
                  onSelectG12(g12Name);
                  onSelectLeader('ALL');
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  selectedG12 === g12Name
                    ? 'bg-[#58bc75] text-white shadow-xs font-bold'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {g12Name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Level 3: Líderes de Célula do G12 Selecionado */}
      {selectedG12 !== 'ALL' && leadersList.length > 0 && (
        <div className="bg-[#eaf4ef]/60 p-3 rounded-2xl border border-[#cbe8d5] space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#236b3c] uppercase tracking-wider">
            <Users className="w-3.5 h-3.5 text-[#2e844b]" />
            <span>Líderes de Célula de {selectedG12}</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => onSelectLeader('ALL')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                selectedLeader === 'ALL'
                  ? 'bg-[#163242] text-white shadow-xs font-bold'
                  : 'bg-white border border-[#c4e3d0] text-slate-700 hover:bg-white/80'
              }`}
            >
              Todos os Líderes
            </button>

            {leadersList.map((leaderName) => (
              <button
                key={leaderName}
                onClick={() => onSelectLeader(leaderName)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  selectedLeader === leaderName
                    ? 'bg-[#163242] text-white shadow-xs font-bold'
                    : 'bg-white border border-[#c4e3d0] text-slate-800 hover:border-slate-400'
                }`}
              >
                {leaderName}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
