import { Shield, Users, Network, Plus } from 'lucide-react';

interface LeadershipStatsBarProps {
  pastorCount: number;
  g12Count: number;
  leaderCount: number;
  onOpenCreate: () => void;
}

export function LeadershipStatsBar({
  pastorCount,
  g12Count,
  leaderCount,
  onOpenCreate,
}: LeadershipStatsBarProps) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-[28px] p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      {/* 3 Metric Mini Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 flex-1">
        {/* Pastores */}
        <div className="bg-[#e8f8ee] border border-[#c4e3d0] rounded-2xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-[#20693a] uppercase tracking-wider">
              Pastores
            </span>
            <Shield className="w-3.5 h-3.5 text-[#2e844b] hidden sm:block" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-[#1a5b32] tracking-tight">
            {pastorCount}
          </span>
        </div>

        {/* G12 */}
        <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Redes G12
            </span>
            <Network className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            {g12Count}
          </span>
        </div>

        {/* Líderes de Célula */}
        <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Líderes de Célula
            </span>
            <Users className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            {leaderCount}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex items-center justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
        <button
          onClick={onOpenCreate}
          className="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-bold bg-[#58bc75] hover:bg-[#4caa68] active:bg-[#3f9a5a] text-white flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Organizador</span>
        </button>
      </div>
    </div>
  );
}
