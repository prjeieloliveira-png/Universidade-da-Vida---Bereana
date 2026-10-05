import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Printer, Download, X, Check, FileSpreadsheet } from 'lucide-react';
import { supabase } from '@/shared/lib/supabase';
import type { TeamMeetingWithDetails } from '../types/teams';

interface TeamsAttendanceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  editionId: string | undefined;
  editionName: string;
  meetings: TeamMeetingWithDetails[];
}

interface ReportMember {
  id: string;
  name: string;
  roleId: string;
  roleName: string;
  sortOrder: number;
}

interface RawReportMember {
  id: string;
  team_role_id: string;
  people: { full_name: string } | null;
  team_roles: { name: string; sort_order: number } | null;
}

const formatDay = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

export function TeamsAttendanceReportModal({
  isOpen,
  onClose,
  editionId,
  editionName,
  meetings,
}: TeamsAttendanceReportModalProps) {
  const orderedMeetings = useMemo(
    () => [...meetings].sort((a, b) => a.meetingDate.localeCompare(b.meetingDate)),
    [meetings]
  );
  const meetingIds = useMemo(() => orderedMeetings.map((m) => m.id), [orderedMeetings]);

  const { data: members = [] } = useQuery<ReportMember[]>({
    queryKey: ['team-report-members', editionId],
    enabled: isOpen && !!editionId,
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select(
          `id, team_role_id,
           people!team_members_person_id_fkey(full_name),
           team_roles!team_members_team_role_id_fkey(name, sort_order)`
        )
        .eq('edition_id', editionId!)
        .eq('active', true);
      if (error) throw error;
      return ((data ?? []) as unknown as RawReportMember[])
        .map((m) => ({
          id: m.id,
          name: m.people?.full_name ?? 'Sem nome',
          roleId: m.team_role_id,
          roleName: m.team_roles?.name ?? 'Equipe',
          sortOrder: m.team_roles?.sort_order ?? 999,
        }))
        .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'pt-BR'));
    },
  });

  const { data: log = [] } = useQuery({
    queryKey: ['team-report-log', meetingIds],
    enabled: isOpen && meetingIds.length > 0,
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_team_attendance_log')
        .select('meeting_id, team_member_id, present, note, marked_by_name')
        .in('meeting_id', meetingIds);
      if (error) throw error;
      return data ?? [];
    },
  });

  const cellMap = useMemo(() => {
    const map = new Map<string, { present: boolean; note: string | null; by: string | null }>();
    log.forEach((r) => {
      if (r.meeting_id && r.team_member_id && r.present !== null) {
        map.set(`${r.team_member_id}|${r.meeting_id}`, {
          present: r.present,
          note: r.note,
          by: r.marked_by_name,
        });
      }
    });
    return map;
  }, [log]);

  if (!isOpen) return null;

  const statusOf = (memberId: string, meetingId: string) => cellMap.get(`${memberId}|${meetingId}`);
  const isConvened = (m: ReportMember, meeting: TeamMeetingWithDetails) =>
    meeting.convocadasRoleIds.includes(m.roleId);
  const totalOf = (m: ReportMember) =>
    orderedMeetings.filter((meeting) => statusOf(m.id, meeting.id)?.present).length;
  const calledOf = (m: ReportMember) =>
    orderedMeetings.filter((meeting) => isConvened(m, meeting)).length;

  const handleExportCSV = () => {
    const headers = [
      'Equipe', 'Nome',
      ...orderedMeetings.map((m) => `${formatDay(m.meetingDate)}${m.title ? ` (${m.title})` : ''}`),
      'Presenças',
    ];
    const rows = members.map((m) => [
      `"${m.roleName.replace(/"/g, '""')}"`,
      `"${m.name.replace(/"/g, '""')}"`,
      ...orderedMeetings.map((meeting) => {
        const st = statusOf(m.id, meeting.id);
        return st ? (st.present ? 'PRESENTE' : 'FALTA') : '';
      }),
      `${totalOf(m)}/${calledOf(m)}`,
    ].join(';'));
    const blob = new Blob(['﻿' + [headers.join(';'), ...rows].join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_chamada_equipes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:static print:bg-white">
      <div className="bg-white rounded-[28px] shadow-2xl border border-slate-200/80 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden print:max-h-none print:shadow-none print:border-none print:rounded-none my-auto">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50/80 print:hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#163242] flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5 text-[#58bc75]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-black text-slate-900 truncate">Relatório de Chamada das Equipes</h3>
              <p className="text-xs text-slate-500 truncate">{editionName} • {orderedMeetings.length} reuniões</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button type="button" onClick={handleExportCSV} className="px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 cursor-pointer">
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>
            <button type="button" onClick={() => window.print()} className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#163242] hover:bg-[#1f4358] text-white flex items-center gap-1.5 cursor-pointer">
              <Printer className="w-3.5 h-3.5 text-[#58bc75]" />
              <span>Imprimir</span>
            </button>
            <button type="button" onClick={onClose} aria-label="Fechar" className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 overflow-auto space-y-3 text-slate-800">
          <div className="border border-slate-200 rounded-2xl overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[560px]">
              <thead>
                <tr className="bg-slate-100/90 text-slate-600 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3 min-w-[160px]">Membro</th>
                  {orderedMeetings.map((m) => (
                    <th key={m.id} className="py-2.5 px-1.5 text-center w-12" title={m.title ?? 'Reunião'}>
                      {formatDay(m.meetingDate)}
                    </th>
                  ))}
                  <th className="py-2.5 px-3 text-center w-16">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70">
                {members.map((m, idx) => (
                  <React.Fragment key={m.id}>
                    {(idx === 0 || members[idx - 1]?.roleId !== m.roleId) && (
                      <tr className="bg-slate-50">
                        <td colSpan={orderedMeetings.length + 2} className="py-1.5 px-3 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                          {m.roleName}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td className="py-2 px-3 font-semibold text-slate-900">{m.name}</td>
                      {orderedMeetings.map((meeting) => {
                        const st = statusOf(m.id, meeting.id);
                        const title = st
                          ? `${st.present ? 'Presente' : 'Falta'}${st.by ? ` • registrado por ${st.by}` : ''}${st.note ? ` • ${st.note}` : ''}`
                          : isConvened(m, meeting)
                          ? 'Ainda não registrado'
                          : 'Equipe não convocada';
                        return (
                          <td key={meeting.id} className="py-2 px-1 text-center" title={title}>
                            {st && (
                              <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black ${st.present ? 'bg-[#58bc75] text-white' : 'bg-rose-100 text-rose-700'}`}>
                                {st.present ? <Check className="w-3 h-3 stroke-[3]" /> : 'F'}
                              </span>
                            )}
                          </td>
                        );
                      })}
                      <td className="py-2 px-2 text-center font-bold text-slate-700">{totalOf(m)}/{calledOf(m)}</td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-center text-[10px] text-slate-400">
            ✓: Presente | F: Falta confirmada | Em branco: ainda não registrado ou equipe não convocada
          </p>
        </div>
      </div>
    </div>
  );
}
