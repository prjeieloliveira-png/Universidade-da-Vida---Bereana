import React, { useMemo, useState } from 'react';
import { ArrowLeft, Loader2, Smartphone } from 'lucide-react';
import { ShareDoorLinkModal } from '@/features/attendance/components/ShareDoorLinkModal';
import { useTeamAttendance } from '../hooks/useTeamAttendance';
import { MeetingAttendanceToolbar, type MeetingStatusFilter } from './MeetingAttendanceToolbar';
import { AttendanceConfirmModal } from '@/features/attendance/components/AttendanceConfirmModal';
import { sortByName } from '@/shared/utils/sortByName';
import { MeetingAttendanceRow } from './MeetingAttendanceRow';
import type { TeamMeetingWithDetails, TeamMemberAttendanceItem } from '../types/teams';

interface MeetingAttendanceSheetProps {
  meeting: TeamMeetingWithDetails;
  editionId: string | undefined;
  onBack: () => void;
}

export const MeetingAttendanceSheet: React.FC<MeetingAttendanceSheetProps> = ({
  meeting,
  editionId,
  onBack,
}) => {
  const { items, isLoading, isError, error, syncStatus, pendingCount, flushQueue, markAttendance } =
    useTeamAttendance({ meetingId: meeting.id, editionId });

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<MeetingStatusFilter>('ALL');
  const [sortAlphabetically, setSortAlphabetically] = useState(false);
  const [confirm, setConfirm] = useState<{
    member: TeamMemberAttendanceItem | null;
    action: 'PRESENTE' | 'FALTA' | null;
  }>({ member: null, action: null });

  const totalCalled = items.length;
  const totalAttended = items.filter((i) => i.present === true).length;
  const totalAbsent = items.filter((i) => i.present === false).length;
  const percentage = totalCalled > 0 ? Math.round((totalAttended / totalCalled) * 100) : 0;

  const visibleItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = items.filter((i) => {
      const matchesSearch =
        !q || i.personName.toLowerCase().includes(q) || i.personPhone.includes(q);
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'PRESENTE' && i.present === true) ||
        (statusFilter === 'FALTA' && i.present === false);
      return matchesSearch && matchesStatus;
    });
    return sortAlphabetically ? sortByName(filtered, (i) => i.personName) : filtered;
  }, [items, searchQuery, statusFilter, sortAlphabetically]);

  const groupedByTeam = useMemo(() => {
    const map = new Map<string, { roleName: string; members: typeof items }>();
    visibleItems.forEach((item) => {
      const existing = map.get(item.teamRoleId);
      if (existing) existing.members.push(item);
      else map.set(item.teamRoleId, { roleName: item.teamRoleName, members: [item] });
    });
    return Array.from(map.entries()).map(([roleId, group]) => ({
      roleId,
      roleName: group.roleName,
      members: group.members,
    }));
  }, [visibleItems]);

  const formattedDate = meeting.meetingDate
    ? new Date(meeting.meetingDate + 'T00:00:00').toLocaleDateString('pt-BR')
    : meeting.meetingDate;

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Top Header Card */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              aria-label="Voltar para a lista de reuniões"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#58bc75]/15 text-[#20693a]">
                  Chamada da Reunião
                </span>
                <span className="text-xs font-bold text-slate-500">{formattedDate}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                {meeting.title || 'Reunião de Equipes'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsShareOpen(true)}
            className="px-4 py-2.5 rounded-full text-xs font-black bg-[#58bc75] hover:bg-[#4caa68] text-white flex items-center gap-2 shadow-xs cursor-pointer active:scale-95 self-start sm:self-auto"
          >
            <Smartphone className="w-4 h-4" />
            <span>Link da Porta</span>
          </button>

          <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-50 border border-slate-200/80 rounded-2xl self-start sm:self-auto">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-900">
                {totalAttended} de {totalCalled} presentes
              </p>
              <p className="text-[10px] text-slate-400">{percentage}% presença</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0">
              {percentage}%
            </div>
          </div>
        </div>

        <MeetingAttendanceToolbar
          syncStatus={syncStatus}
          pendingCount={pendingCount}
          onForceSync={() => void flushQueue()}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortAlphabetically={sortAlphabetically}
          onToggleSort={() => setSortAlphabetically((v) => !v)}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          totalCalled={totalCalled}
          totalAttended={totalAttended}
          totalAbsent={totalAbsent}
        />
      </div>

      {isLoading && (
        <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#58bc75]" />
          <span className="text-xs">Carregando lista de chamada...</span>
        </div>
      )}

      {isError && (
        <div className="p-5 bg-rose-50 border border-rose-200 rounded-3xl text-center text-xs text-rose-700">
          Erro ao carregar chamada: {error instanceof Error ? error.message : 'Falha na conexão'}
        </div>
      )}

      {!isLoading && groupedByTeam.length === 0 && (
        <div className="p-8 text-center bg-white rounded-3xl border border-slate-200/80 text-xs text-slate-500">
          Nenhuma equipe foi convocada ou não há membros ativos nas equipes convocadas.
        </div>
      )}

      <div className="space-y-4">
        {groupedByTeam.map((group) => {
          const teamTotal = group.members.length;
          const teamAttended = group.members.filter((m) => m.present === true).length;

          return (
            <div
              key={group.roleId}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden"
            >
              <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">
                    {group.roleName}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200/80 text-slate-700">
                    {teamAttended}/{teamTotal} presentes
                  </span>
                </div>
              </div>

              <div className="p-3 sm:p-4 divide-y divide-slate-100">
                {group.members.map((member) => (
                  <MeetingAttendanceRow
                    key={member.memberId}
                    member={member}
                    onSelectAction={(m, action) => setConfirm({ member: m, action })}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <AttendanceConfirmModal
        isOpen={confirm.member !== null}
        subjectId={confirm.member?.memberId ?? null}
        subjectName={confirm.member?.personName ?? null}
        subjectLabel="Membro selecionado:"
        subjectNoun="membro"
        contextLabel={`Reunião • ${formattedDate}`}
        details={confirm.member ? [{ label: 'Equipe', value: confirm.member.teamRoleName }] : []}
        action={confirm.action}
        onConfirm={(note) => {
          if (confirm.member && confirm.action) {
            markAttendance(confirm.member.memberId, confirm.action === 'PRESENTE', note);
          }
          setConfirm({ member: null, action: null });
        }}
        onClose={() => setConfirm({ member: null, action: null })}
      />

      <ShareDoorLinkModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        path={`/equipes/porta?reuniao=${meeting.id}`}
        title="Chamada da Equipe na Porta"
        subtitle={`Link da reunião de ${formattedDate}`}
        instructions="Envie este link para quem fará a chamada. Ao abrir no celular (com login ativo no aparelho), eles marcam presença ou falta de cada membro com confirmação."
        whatsappIntro={`Olá! Segue o link para fazer a chamada da equipe (reunião de ${formattedDate} - Universidade da Vida):`}
      />
    </div>
  );
};
