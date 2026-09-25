import React, { useState, useMemo, useEffect } from 'react';
import { Search, Eye, EyeOff, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { TeamCard } from './TeamCard';
import { MoveTeamModal } from './MoveTeamModal';
import { ToggleMemberActiveModal } from './ToggleMemberActiveModal';
import { unmaskPhone } from '@/shared/utils/phone';
import type { TeamRoleRow, TeamMemberWithDetails } from '../types/teams';
import type { useTeamMembers } from '../hooks/useTeamMembers';

interface TeamListTabProps {
  roles: TeamRoleRow[];
  isRolesLoading: boolean;
  teamMembersHook: ReturnType<typeof useTeamMembers>;
  onAddMember: (roleId?: string) => void;
  onEditMember: (member: TeamMemberWithDetails) => void;
}

export const TeamListTab: React.FC<TeamListTabProps> = ({
  roles,
  isRolesLoading,
  teamMembersHook,
  onAddMember,
  onEditMember,
}) => {
  const {
    members,
    isLoading: isMembersLoading,
    isError,
    error,
    refetch,
    toggleActive,
    moveTeam,
  } = teamMembersHook;

  const [searchQuery, setSearchQuery] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [memberToMove, setMemberToMove] = useState<TeamMemberWithDetails | null>(null);
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
  const [memberToToggle, setMemberToToggle] = useState<TeamMemberWithDetails | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Filtrar membros por busca e status ativo
  const filteredMembers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const cleanQ = unmaskPhone(searchQuery);

    return members.filter((m) => {
      // Filtro de inativos
      if (!showInactive && !m.active) return false;

      // Filtro de busca
      if (!q) return true;
      const nameMatches = m.person.fullName.toLowerCase().includes(q);
      const phoneMatches = cleanQ ? m.person.phone.includes(cleanQ) : false;
      const notesMatches = m.notes?.toLowerCase().includes(q) ?? false;
      return nameMatches || phoneMatches || notesMatches;
    });
  }, [members, searchQuery, showInactive]);

  const handleOpenMove = (member: TeamMemberWithDetails) => {
    setMemberToMove(member);
    setIsMoveModalOpen(true);
  };

  const handleOpenToggleActive = (member: TeamMemberWithDetails) => {
    setMemberToToggle(member);
    setIsToggleModalOpen(true);
  };

  const handleConfirmToggleActive = async (memberId: string, nextActive: boolean) => {
    await toggleActive({ memberId, active: nextActive });
    if (!nextActive) {
      setToastMessage(
        'Membro desativado. Ative "Mostrar Inativos" para visualizá-lo se necessário.'
      );
    } else {
      setToastMessage('Membro reativado com sucesso.');
    }
  };

  if (isRolesLoading || isMembersLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-[#58bc75]" />
        <span className="text-xs font-semibold">Carregando equipes e integrantes...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 text-center space-y-3 my-6">
        <AlertCircle className="w-6 h-6 text-rose-600 mx-auto" />
        <p className="text-sm font-bold text-rose-900">Erro ao carregar membros das equipes</p>
        <p className="text-xs text-rose-700">
          {error instanceof Error ? error.message : 'Falha na comunicação com o banco de dados.'}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-full text-xs font-bold bg-white border border-rose-200 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Tentar novamente</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/80 shadow-2xs">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome ou telefone..."
            className="w-full pl-11 pr-4 py-2.5 min-h-[44px] text-xs sm:text-sm bg-slate-50 border border-slate-200/80 rounded-full focus:outline-none focus:ring-2 focus:ring-[#58bc75] focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {/* Toggle Inactive Members Pill Button (touch target >= 44px) */}
        <button
          type="button"
          onClick={() => setShowInactive(!showInactive)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-full text-xs font-bold transition-all cursor-pointer border ${
            showInactive
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
          aria-label={showInactive ? 'Ocultar inativos' : 'Mostrar inativos'}
        >
          {showInactive ? (
            <>
              <EyeOff className="w-4 h-4 text-[#58bc75]" />
              <span>Ocultar Inativos</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 text-slate-400" />
              <span>Mostrar Inativos</span>
            </>
          )}
        </button>
      </div>

      {/* Cards List per Team in Sort Order (1 to 9) */}
      <div className="space-y-4">
        {roles.map((role) => {
          const roleMembers = filteredMembers.filter((m) => m.teamRoleId === role.id);
          return (
            <TeamCard
              key={role.id}
              role={role}
              members={roleMembers}
              showInactive={showInactive}
              onAddMember={onAddMember}
              onEditMember={onEditMember}
              onMoveMember={handleOpenMove}
              onToggleActiveMember={handleOpenToggleActive}
            />
          );
        })}
      </div>

      {/* Modal de Mover de Equipe */}
      <MoveTeamModal
        isOpen={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        member={memberToMove}
        roles={roles}
        onConfirmMove={async (mId, roleId) => {
          await moveTeam({ memberId: mId, newTeamRoleId: roleId });
        }}
      />

      {/* Modal de Desativar / Reativar Membro */}
      <ToggleMemberActiveModal
        isOpen={isToggleModalOpen}
        onClose={() => {
          setIsToggleModalOpen(false);
          setMemberToToggle(null);
        }}
        member={memberToToggle}
        onConfirmToggle={handleConfirmToggleActive}
      />

      {/* Floating Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 bg-slate-900/95 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 backdrop-blur-xs border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1 cursor-pointer"
            aria-label="Fechar notificação"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
