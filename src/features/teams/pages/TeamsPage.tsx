import { useState } from 'react';
import { Users, Calendar, Plus, Copy, Printer, Loader2, ShieldAlert } from 'lucide-react';
import { useActiveEdition } from '@/shared/hooks/useActiveEdition';
import { useUserRole } from '@/shared/hooks/useUserRole';
import { useTeamRoles } from '../hooks/useTeamRoles';
import { useTeamMembers } from '../hooks/useTeamMembers';
import { useTeamMeetings } from '../hooks/useTeamMeetings';
import { TeamListTab } from '../components/TeamListTab';
import { MeetingListTab } from '../components/MeetingListTab';
import { TeamMemberModal } from '../components/TeamMemberModal';
import { CopyTeamsModal } from '../components/CopyTeamsModal';
import { TeamsPrintModal } from '../components/TeamsPrintModal';
import type { TeamMemberWithDetails } from '../types/teams';

type ActiveTab = 'membros' | 'reunioes';

export function TeamsPage() {
  const { isCoordOrSec, isLoading: isAuthLoading } = useUserRole();
  const { data: edition, isLoading: isEditionLoading } = useActiveEdition();

  const editionId = edition?.id;

  const [tab, setTab] = useState<ActiveTab>('membros');
  const [memberModal, setMemberModal] = useState<{
    isOpen: boolean;
    initialMember?: TeamMemberWithDetails | null;
    defaultRoleId?: string;
  }>({ isOpen: false });
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Queries e Hooks
  const { data: roles = [], isLoading: isRolesLoading } = useTeamRoles();
  const teamMembersHook = useTeamMembers(editionId);
  const teamMeetingsHook = useTeamMeetings(editionId);

  // Total de membros ativos da turma
  const totalActiveMembers = teamMembersHook.members.filter((m) => m.active).length;

  if (isAuthLoading || isEditionLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
        <Loader2 className="w-7 h-7 animate-spin text-[#58bc75]" />
        <span className="text-xs font-semibold">Verificando permissões e turma...</span>
      </div>
    );
  }

  // Verificação de permissão: apenas coordinator e secretary têm acesso
  if (!isCoordOrSec) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 text-center bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-black text-slate-900">Acesso Restrito</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          O módulo de Equipes de Serviço da Universidade da Vida é restrito à Coordenação Geral e à
          Secretaria.
        </p>
      </div>
    );
  }

  if (!edition) {
    return (
      <div className="text-center py-16 text-slate-400 text-xs">
        Nenhuma edição ativa configurada no banco de dados.
      </div>
    );
  }

  const handleOpenAddMember = (roleId?: string) => {
    setMemberModal({
      isOpen: true,
      initialMember: null,
      defaultRoleId: roleId || roles[0]?.id,
    });
  };

  const handleOpenEditMember = (member: TeamMemberWithDetails) => {
    setMemberModal({
      isOpen: true,
      initialMember: member,
      defaultRoleId: member.teamRoleId,
    });
  };

  const handleCloseMemberModal = () => {
    setMemberModal((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
            <span>Portal</span>
            <span>&gt;</span>
            <span className="text-slate-600 font-semibold">Equipes</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Equipes da UV
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {totalActiveMembers} voluntários ativos servindo nesta turma
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-full text-xs font-bold bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200/90 text-slate-700 transition-colors shadow-2xs cursor-pointer"
            title="Imprimir relação de equipes em folha A4"
            aria-label="Imprimir relação de equipes em folha A4"
          >
            <Printer className="w-4 h-4 text-[#58bc75]" />
            <span className="hidden sm:inline">Imprimir Equipes</span>
            <span className="sm:hidden">Imprimir</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCopyModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-full text-xs font-bold bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200/90 text-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <Copy className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Copiar Equipes</span>
            <span className="sm:hidden">Copiar</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenAddMember()}
            className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-full text-xs font-bold bg-[#58bc75] hover:bg-[#4caa68] active:bg-[#419a5c] text-white transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Membro</span>
          </button>
        </div>
      </div>

      {/* Segmented Pill Tabs Navigation */}
      <div className="flex gap-1.5 bg-slate-200/60 p-1 rounded-2xl max-w-md">
        <button
          type="button"
          onClick={() => setTab('membros')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all cursor-pointer ${
            tab === 'membros'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Membros ({totalActiveMembers})</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('reunioes')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all cursor-pointer ${
            tab === 'reunioes'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Reuniões ({teamMeetingsHook.meetings.length})</span>
        </button>
      </div>

      {/* Active Tab Content */}
      {tab === 'membros' ? (
        <TeamListTab
          roles={roles}
          isRolesLoading={isRolesLoading}
          teamMembersHook={teamMembersHook}
          onAddMember={handleOpenAddMember}
          onEditMember={handleOpenEditMember}
        />
      ) : (
        <MeetingListTab roles={roles} editionId={editionId} teamMeetingsHook={teamMeetingsHook} />
      )}

      {/* Global Modals */}
      <TeamMemberModal
        isOpen={memberModal.isOpen}
        onClose={handleCloseMemberModal}
        roles={roles}
        initialMember={memberModal.initialMember}
        defaultRoleId={memberModal.defaultRoleId}
        onSaveCreate={teamMembersHook.addMember}
        onSaveUpdate={teamMembersHook.updateMember}
      />

      <CopyTeamsModal
        isOpen={isCopyModalOpen}
        onClose={() => setIsCopyModalOpen(false)}
        currentEdition={edition}
      />

      <TeamsPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        roles={roles}
        members={teamMembersHook.members}
        editionName={edition.name}
      />
    </div>
  );
}
