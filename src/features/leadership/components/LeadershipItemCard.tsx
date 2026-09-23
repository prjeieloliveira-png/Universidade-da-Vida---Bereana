import { Shield, Network, Users, Edit2, Trash2, CheckCircle2, Circle } from 'lucide-react';
import type { DisplayLeaderItem } from '../pages/LeadershipPage';

interface LeadershipItemCardProps {
  item: DisplayLeaderItem;
  isActiveInCohort: boolean;
  onToggleCohortActive?: () => void;
  onEdit: (item: DisplayLeaderItem) => void;
  onDelete: (item: DisplayLeaderItem) => void;
}

export function LeadershipItemCard({
  item,
  isActiveInCohort,
  onToggleCohortActive,
  onEdit,
  onDelete,
}: LeadershipItemCardProps) {
  return (
    <div className="bg-white border border-slate-200/90 rounded-[22px] p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-all">
      {/* Left Info */}
      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
        <div
          className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold shrink-0 shadow-2xs ${
            item.role === 'PASTOR'
              ? 'bg-[#163242] text-white'
              : item.role === 'G12'
              ? 'bg-[#58bc75] text-white'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          {item.role === 'PASTOR' && <Shield className="w-4 h-4" />}
          {item.role === 'G12' && <Network className="w-4 h-4" />}
          {item.role === 'LEADER' && <Users className="w-4 h-4" />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm sm:text-base font-bold text-slate-800 truncate">
              {item.name}
            </h4>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                item.role === 'PASTOR'
                  ? 'bg-[#163242]/10 text-[#163242]'
                  : item.role === 'G12'
                  ? 'bg-[#58bc75]/15 text-[#20693a]'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {item.roleLabel}
            </span>

            {onToggleCohortActive && (
              <button
                type="button"
                onClick={onToggleCohortActive}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer transition-colors ${
                  isActiveInCohort
                    ? 'bg-[#e8f8ee] text-[#20693a] border border-[#c4e3d0]'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
                title="Clique para alternar participação na turma ativa"
              >
                {isActiveInCohort ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-[#2e844b]" />
                    <span>Na Turma</span>
                  </>
                ) : (
                  <>
                    <Circle className="w-3 h-3 text-slate-300" />
                    <span>Inativo nesta Turma</span>
                  </>
                )}
              </button>
            )}
          </div>

          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
            {item.role === 'PASTOR' && 'Pastor Titular / Rede'}
            {item.role === 'G12' && `Pastor: ${item.pastorName}`}
            {item.role === 'LEADER' && `Rede G12: ${item.g12Name} • Pastor: ${item.pastorName}`}
            {item.phone && ` • Tel: ${item.phone}`}
          </p>
        </div>
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        <button
          onClick={() => onEdit(item)}
          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5 text-slate-500" />
          <span>Editar</span>
        </button>
        <button
          onClick={() => onDelete(item)}
          className="w-8 h-8 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
          title="Excluir"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
