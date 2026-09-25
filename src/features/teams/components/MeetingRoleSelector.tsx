import React from 'react';
import { CheckSquare, Square } from 'lucide-react';
import type { TeamRoleRow } from '../types/teams';

interface MeetingRoleSelectorProps {
  roles: TeamRoleRow[];
  selectedRoleIds: string[];
  onToggleRole: (roleId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export const MeetingRoleSelector: React.FC<MeetingRoleSelectorProps> = ({
  roles,
  selectedRoleIds,
  onToggleRole,
  onSelectAll,
  onDeselectAll,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-bold text-slate-700">
          Equipes Convocadas * ({selectedRoleIds.length} de {roles.length})
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSelectAll}
            className="text-[11px] font-bold text-[#20693a] hover:underline cursor-pointer"
          >
            Todas
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={onDeselectAll}
            className="text-[11px] font-bold text-slate-500 hover:underline cursor-pointer"
          >
            Nenhuma
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto p-1">
        {roles.map((r) => {
          const isChecked = selectedRoleIds.includes(r.id);
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onToggleRole(r.id)}
              className={`flex items-center gap-2.5 p-2.5 min-h-[44px] rounded-2xl border text-left text-xs transition-all cursor-pointer ${
                isChecked
                  ? 'bg-[#e8f8ee] border-[#b5dec1] text-slate-900 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {isChecked ? (
                <CheckSquare className="w-4 h-4 text-[#2e844b] shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-slate-400 shrink-0" />
              )}
              <span className="truncate">{r.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
