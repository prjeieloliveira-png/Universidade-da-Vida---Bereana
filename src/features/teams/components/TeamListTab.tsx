import React, { useState, useMemo, useEffect } from 'react';
import { Search, Eye, EyeOff, Loader2, AlertCircle, RefreshCw, ArrowDownAZ, Gift } from 'lucide-react';
import { TeamCard } from './TeamCard';
import { MoveTeamModal } from './MoveTeamModal';
import { ToggleMemberActiveModal } from './ToggleMemberActiveModal';
import { DeleteTeamMemberModal } from './DeleteTeamMemberModal';
import { unmaskPhone } from '@/shared/utils/phone';
import { sortByName } from '@/shared/utils/sortByName';
import type { TeamRoleRow, TeamMemberWithDetails } from '../types/teams';
import type { useTeamMembers } from '../hooks/useTeamMembers';

type PaymentFilter = 'ALL' | 'paid' | 'pending' | 'courtesy';

interface TeamListTabProps {
  roles: TeamRoleRow[];
  isRolesLoading: boolean;
  teamMembersHook: ReturnType<typeof useTeamMembers>;
  onAddMember: (roleId?: string) => void;
  onEditMember: (member: TeamMemberWithDetails) => void;
  onEditRole?: (role: TeamRoleRow) => void;
  onDeleteRole?: (role: TeamRoleRow) => void;
}

export const TeamListTab: React.FC<TeamListTabProps> = ({
  roles, isRolesLoading, teamMembersHook, onAddMember, onEditMember, onEditRole, onDeleteRole,
}) => {
  const { members, isLoading, isError, error, refetch, toggleActive, toggleCourtesy, moveTeam, deleteMember } = teamMembersHook;

  const [searchQuery, setSearchQuery] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [sortAlphabetically, setSortAlphabetically] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('ALL');
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [memberToMove, setMemberToMove] = useState<TeamMemberWithDetails | null>(null);
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
  const [memberToToggle, setMemberToToggle] = useState<TeamMemberWithDetails | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMemberWithDetails | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const paymentCounts = useMemo(() => {
    const counts = { all: 0, paid: 0, pending: 0, courtesy: 0 };
    members.forEach((m) => {
      if (!showInactive && !m.active) return;
      counts.all++;
      if (m.isCourtesy || m.payment?.status === 'courtesy') counts.courtesy++;
      else if (m.payment?.status === 'paid') counts.paid++;
      else counts.pending++;
    });
    return counts;
  }, [members, showInactive]);

  const filteredMembers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const cleanQ = unmaskPhone(searchQuery);

    const filtered = members.filter((m) => {
      if (!showInactive && !m.active) return false;

      if (paymentFilter === 'paid' && (m.isCourtesy || m.payment?.status !== 'paid')) return false;
      if (paymentFilter === 'pending' && (m.isCourtesy || m.payment?.status === 'paid' || m.payment?.status === 'courtesy')) return false;
      if (paymentFilter === 'courtesy' && !m.isCourtesy && m.payment?.status !== 'courtesy') return false;

      if (!q) return true;
      return (
        m.person.fullName.toLowerCase().includes(q) ||
        (cleanQ ? m.person.phone.includes(cleanQ) : false) ||
        (m.notes?.toLowerCase().includes(q) ?? false)
      );
    });

    return sortAlphabetically ? sortByName(filtered, (m) => m.person.fullName) : filtered;
  }, [members, searchQuery, showInactive, sortAlphabetically, paymentFilter]);

  const handleToggleCourtesy = async (member: TeamMemberWithDetails) => {
    const nextVal = !member.isCourtesy;
    try {
      await toggleCourtesy({ memberId: member.id, isCourtesy: nextVal });
      setToastMessage(nextVal ? `${member.person.fullName} marcado como Cortesia.` : `Cortesia removida de ${member.person.fullName}.`);
    } catch (err: unknown) {
      setToastMessage(err instanceof Error ? err.message : 'Erro ao alterar cortesia.');
    }
  };

  const handleConfirmToggleActive = async (memberId: string, nextActive: boolean) => {
    await toggleActive({ memberId, active: nextActive });
    setToastMessage(!nextActive ? 'Membro desativado.' : 'Membro reativado.');
  };

  if (isRolesLoading || isLoading) {
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
        <p className="text-xs text-rose-700">{error instanceof Error ? error.message : 'Falha na comunicação com o banco.'}</p>
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
      <div className="space-y-2.5 bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSortAlphabetically((v) => !v)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-full text-xs font-bold transition-all cursor-pointer border shrink-0 ${
                sortAlphabetically ? 'bg-slate-900 text-white border-slate-900 shadow-xs' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title={sortAlphabetically ? 'Ordenação alfabética' : 'Ordenar A-Z'}
            >
              <ArrowDownAZ className={`w-4 h-4 ${sortAlphabetically ? 'text-[#58bc75]' : 'text-slate-400'}`} />
              <span>A-Z</span>
            </button>

            <button
              type="button"
              onClick={() => setShowInactive(!showInactive)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-full text-xs font-bold transition-all cursor-pointer border ${
                showInactive ? 'bg-slate-900 text-white border-slate-900 shadow-xs' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {showInactive ? <><EyeOff className="w-4 h-4 text-[#58bc75]" /><span>Ocultar Inativos</span></> : <><Eye className="w-4 h-4 text-slate-400" /><span>Mostrar Inativos</span></>}
            </button>
          </div>
        </div>

        {/* Filtros de Pagamento e Cortesia */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-slate-100">
          {(
            [
              { id: 'ALL', label: 'Todos', count: paymentCounts.all },
              { id: 'paid', label: 'Pagos', count: paymentCounts.paid },
              { id: 'pending', label: 'Pendentes', count: paymentCounts.pending },
              { id: 'courtesy', label: 'Cortesia', count: paymentCounts.courtesy },
            ] as const
          ).map((p) => {
            const isActive = paymentFilter === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPaymentFilter(p.id)}
                className={`px-3 py-1.5 min-h-[38px] rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 border ${
                  isActive ? 'bg-slate-900 text-white border-slate-900 shadow-xs' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white'
                }`}
              >
                {p.id === 'courtesy' && <Gift className={`w-3 h-3 ${isActive ? 'text-amber-300' : 'text-amber-600'}`} />}
                <span>{p.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-slate-700'}`}>
                  {p.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cards List per Team */}
      <div className="space-y-4">
        {roles.map((role) => (
          <TeamCard
            key={role.id}
            role={role}
            members={filteredMembers.filter((m) => m.teamRoleId === role.id)}
            showInactive={showInactive}
            onAddMember={onAddMember}
            onEditMember={onEditMember}
            onMoveMember={(m) => { setMemberToMove(m); setIsMoveModalOpen(true); }}
            onToggleActiveMember={(m) => { setMemberToToggle(m); setIsToggleModalOpen(true); }}
            onToggleCourtesyMember={handleToggleCourtesy}
            onDeleteMember={(m) => { setMemberToDelete(m); setIsDeleteModalOpen(true); }}
            onEditRole={onEditRole}
            onDeleteRole={onDeleteRole}
          />
        ))}
      </div>

      <MoveTeamModal
        isOpen={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        member={memberToMove}
        roles={roles}
        onConfirmMove={async (mId, roleId) => { await moveTeam({ memberId: mId, newTeamRoleId: roleId }); }}
      />
      <ToggleMemberActiveModal
        isOpen={isToggleModalOpen}
        onClose={() => { setIsToggleModalOpen(false); setMemberToToggle(null); }}
        member={memberToToggle}
        onConfirmToggle={handleConfirmToggleActive}
      />
      <DeleteTeamMemberModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setMemberToDelete(null); }}
        member={memberToDelete}
        onConfirmDelete={async (id) => { await deleteMember(id); setToastMessage('Membro excluído da equipe.'); }}
      />

      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 bg-slate-900/95 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 backdrop-blur-xs border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <span>{toastMessage}</span>
          <button type="button" onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white p-1 cursor-pointer">✕</button>
        </div>
      )}
    </div>
  );
};
