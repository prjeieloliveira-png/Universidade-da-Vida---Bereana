import React, { useState } from 'react';
import { ChevronDown, Plus, Users } from 'lucide-react';
import { TeamMemberRow } from './TeamMemberRow';
import type { TeamRoleRow, TeamMemberWithDetails } from '../types/teams';

interface TeamCardProps {
  role: TeamRoleRow;
  members: TeamMemberWithDetails[];
  showInactive: boolean;
  onAddMember: (roleId: string) => void;
  onEditMember: (member: TeamMemberWithDetails) => void;
  onMoveMember: (member: TeamMemberWithDetails) => void;
  onToggleActiveMember: (member: TeamMemberWithDetails) => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  role,
  members,
  showInactive,
  onAddMember,
  onEditMember,
  onMoveMember,
  onToggleActiveMember,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Filtrar inativos se showInactive for falso
  const visibleMembers = members.filter((m) => (showInactive ? true : m.active));
  const activeCount = members.filter((m) => m.active).length;

  return (
    <div
      data-testid={`team-card-${role.id}`}
      className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden transition-all"
    >
      {/* Card Header (Accordion toggle + quick actions) */}
      <div className="p-4 sm:p-5 flex items-center justify-between gap-3 bg-slate-50/60 border-b border-slate-100">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-3 text-left min-w-0 flex-1 cursor-pointer group"
          aria-expanded={isExpanded}
        >
          {/* Sort Order Badge */}
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            {role.sort_order}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 truncate">
                {role.name}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-200/80 text-slate-700">
                {activeCount} {activeCount === 1 ? 'membro' : 'membros'}
              </span>
            </div>
            {!isExpanded && visibleMembers.length > 0 && (
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {visibleMembers.map((m) => m.person.fullName).join(', ')}
              </p>
            )}
          </div>
        </button>

        {/* Right Header Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddMember(role.id);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] rounded-full text-xs font-bold bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 shadow-2xs transition-all cursor-pointer active:scale-95"
            aria-label={`Adicionar membro na equipe ${role.name}`}
          >
            <Plus className="w-3.5 h-3.5 text-[#58bc75]" />
            <span className="hidden sm:inline">Adicionar</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-11 h-11 rounded-full hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-all cursor-pointer"
            aria-label={isExpanded ? 'Recolher equipe' : 'Expandir equipe'}
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Card Body: Members List */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-2.5">
          {visibleMembers.length === 0 ? (
            <div className="text-center py-8 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/40">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-500">
                Nenhum membro cadastrado nesta equipe
              </p>
              <button
                type="button"
                onClick={() => onAddMember(role.id)}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-full text-xs font-bold bg-[#58bc75] hover:bg-[#4caa68] text-white transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Primeiro Membro</span>
              </button>
            </div>
          ) : (
            visibleMembers.map((member) => (
              <TeamMemberRow
                key={member.id}
                member={member}
                onEdit={onEditMember}
                onMove={onMoveMember}
                onToggleActive={onToggleActiveMember}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};
