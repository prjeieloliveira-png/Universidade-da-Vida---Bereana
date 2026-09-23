import { Shield, Network, Users, CheckSquare, Square } from 'lucide-react';
import type { PastorRecord, G12Record, LeaderRecord } from '@/features/leadership/types';

interface CohortLeaderListProps {
  pastors: PastorRecord[];
  g12s: G12Record[];
  leaders: LeaderRecord[];
  selectedLeaderIds: string[];
  onToggleLeader: (id: string) => void;
}

export function CohortLeaderList({
  pastors,
  g12s,
  leaders,
  selectedLeaderIds,
  onToggleLeader,
}: CohortLeaderListProps) {
  return (
    <div className="p-4 sm:p-5 overflow-y-auto space-y-2 flex-1 max-h-[50vh]">
      {/* Pastores */}
      <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider pt-1">
        Pastores
      </div>
      {pastors.map((p) => {
        const isSelected = selectedLeaderIds.includes(p.id);
        return (
          <button
            type="button"
            key={p.id}
            onClick={() => onToggleLeader(p.id)}
            className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
              isSelected
                ? 'border-[#58bc75] bg-[#e8f8ee]/40'
                : 'border-slate-200 bg-white opacity-60 hover:opacity-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Shield className="w-3.5 h-3.5 text-[#2e844b]" />
              <span className="text-xs font-bold text-slate-800">{p.name}</span>
            </div>
            {isSelected ? (
              <CheckSquare className="w-4 h-4 text-[#2e844b]" />
            ) : (
              <Square className="w-4 h-4 text-slate-300" />
            )}
          </button>
        );
      })}

      {/* G12 */}
      <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider pt-2">
        Redes G12
      </div>
      {g12s.map((g) => {
        const isSelected = selectedLeaderIds.includes(g.id);
        return (
          <button
            type="button"
            key={g.id}
            onClick={() => onToggleLeader(g.id)}
            className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
              isSelected
                ? 'border-[#58bc75] bg-[#e8f8ee]/40'
                : 'border-slate-200 bg-white opacity-60 hover:opacity-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Network className="w-3.5 h-3.5 text-[#58bc75]" />
              <div>
                <div className="text-xs font-bold text-slate-800">{g.name}</div>
                <div className="text-[10px] text-slate-400">Pastor: {g.pastorName}</div>
              </div>
            </div>
            {isSelected ? (
              <CheckSquare className="w-4 h-4 text-[#2e844b]" />
            ) : (
              <Square className="w-4 h-4 text-slate-300" />
            )}
          </button>
        );
      })}

      {/* Cell Leaders */}
      <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider pt-2">
        Líderes
      </div>
      {leaders.map((l) => {
        const isSelected = selectedLeaderIds.includes(l.id);
        return (
          <button
            type="button"
            key={l.id}
            onClick={() => onToggleLeader(l.id)}
            className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
              isSelected
                ? 'border-[#58bc75] bg-[#e8f8ee]/40'
                : 'border-slate-200 bg-white opacity-60 hover:opacity-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <div>
                <div className="text-xs font-bold text-slate-800">{l.name}</div>
                <div className="text-[10px] text-slate-400">G12: {l.g12Name}</div>
              </div>
            </div>
            {isSelected ? (
              <CheckSquare className="w-4 h-4 text-[#2e844b]" />
            ) : (
              <Square className="w-4 h-4 text-slate-300" />
            )}
          </button>
        );
      })}
    </div>
  );
}
