import React, { useMemo } from 'react';
import { ArrowLeft, Check, CheckCheck, Loader2, MessageCircle, XCircle } from 'lucide-react';
import { useTeamAttendance } from '../hooks/useTeamAttendance';
import { formatPhone, getWhatsAppLink } from '@/shared/utils/phone';
import type { TeamMeetingWithDetails } from '../types/teams';

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
  const {
    items,
    isLoading,
    isError,
    error,
    toggleAttendance,
    markTeamAllPresent,
    markAllPresent,
    markAllAbsent,
    isBatching,
  } = useTeamAttendance({ meetingId: meeting.id, editionId });

  const totalCalled = items.length;
  const totalAttended = items.filter((i) => i.present).length;
  const percentage = totalCalled > 0 ? Math.round((totalAttended / totalCalled) * 100) : 0;

  const groupedByTeam = useMemo(() => {
    const map = new Map<string, { roleName: string; members: typeof items }>();
    items.forEach((item) => {
      const existing = map.get(item.teamRoleId);
      if (existing) existing.members.push(item);
      else map.set(item.teamRoleId, { roleName: item.teamRoleName, members: [item] });
    });
    return Array.from(map.entries()).map(([roleId, group]) => ({
      roleId,
      roleName: group.roleName,
      members: group.members,
    }));
  }, [items]);

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

        {/* Global Batch Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-slate-500">
            Toque nos membros para alternar presença e falta:
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void markAllAbsent()}
              disabled={isBatching}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] rounded-full text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            >
              <XCircle className="w-4 h-4 text-slate-400" />
              <span>Marcar Ausentes</span>
            </button>
            <button
              type="button"
              onClick={() => void markAllPresent()}
              disabled={isBatching}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 min-h-[44px] rounded-full text-xs font-bold bg-[#58bc75] hover:bg-[#4caa68] text-white transition-colors shadow-xs cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Marcar Presentes</span>
            </button>
          </div>
        </div>
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
          const teamAttended = group.members.filter((m) => m.present).length;

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
                <button
                  type="button"
                  onClick={() => void markTeamAllPresent(group.roleId)}
                  disabled={isBatching}
                  className="text-xs font-bold text-[#20693a] hover:underline cursor-pointer min-h-[44px] flex items-center"
                >
                  Marcar equipe presente
                </button>
              </div>

              <div className="p-3 sm:p-4 divide-y divide-slate-100">
                {group.members.map((member) => {
                  const waLink = getWhatsAppLink(member.personPhone);
                  return (
                    <div
                      key={member.memberId}
                      className="py-2.5 sm:py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-slate-900 truncate">
                          {member.personName}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="font-mono">{formatPhone(member.personPhone)}</span>
                          {waLink && (
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 hover:text-emerald-700 p-1"
                              title="WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          void toggleAttendance({
                            memberId: member.memberId,
                            present: !member.present,
                          })
                        }
                        className={`min-h-[44px] px-4 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95 ${
                          member.present
                            ? 'bg-[#58bc75] hover:bg-[#4caa68] text-white shadow-[#58bc75]/25'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
                        }`}
                        aria-label={`Presença de ${member.personName}: ${member.present ? 'Presente' : 'Ausente'}`}
                      >
                        {member.present ? (
                          <>
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>Presente</span>
                          </>
                        ) : (
                          <>
                            <span className="w-2 h-2 rounded-full bg-slate-300" />
                            <span>Ausente</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
