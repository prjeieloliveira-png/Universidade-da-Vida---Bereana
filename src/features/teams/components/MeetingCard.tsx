import React from 'react';
import { Calendar, CheckSquare, Edit2, Trash2 } from 'lucide-react';
import type { TeamRoleRow, TeamMeetingWithDetails } from '../types/teams';

interface MeetingCardProps {
  meeting: TeamMeetingWithDetails;
  roles: TeamRoleRow[];
  onOpenAttendance: (meeting: TeamMeetingWithDetails) => void;
  onEdit: (meeting: TeamMeetingWithDetails) => void;
  onDelete: (meeting: TeamMeetingWithDetails) => void;
}

export const MeetingCard: React.FC<MeetingCardProps> = ({
  meeting,
  roles,
  onOpenAttendance,
  onEdit,
  onDelete,
}) => {
  const roleNameMap = new Map<string, string>(roles.map((r) => [r.id, r.name]));

  const formattedDate = meeting.meetingDate
    ? new Date(meeting.meetingDate + 'T00:00:00').toLocaleDateString('pt-BR')
    : meeting.meetingDate;

  const { calledCount, attendedCount, percentage } = meeting.attendanceSummary;

  const isAllRoles = meeting.convocadasRoleIds.length === roles.length;

  return (
    <div
      data-testid={`meeting-card-${meeting.id}`}
      className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      {/* Left: Date, Title, Notes & Convocadas tags */}
      <div className="space-y-2 min-w-0 flex-1">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold">
            <Calendar className="w-3.5 h-3.5 text-[#58bc75]" />
            <span>{formattedDate}</span>
          </div>

          <span className="font-extrabold text-sm sm:text-base text-slate-900 truncate">
            {meeting.title || 'Reunião de Equipes'}
          </span>
        </div>

        {meeting.notes && <p className="text-xs text-slate-500 line-clamp-2">{meeting.notes}</p>}

        {/* Convocadas tags */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Convocados:
          </span>
          {isAllRoles ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
              Todas as Equipes
            </span>
          ) : (
            meeting.convocadasRoleIds.map((rId) => (
              <span
                key={rId}
                className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600"
              >
                {roleNameMap.get(rId) || 'Equipe'}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Right: Presence counter & Actions */}
      <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
        {/* Attendance Counter Badge */}
        <div className="text-left md:text-right">
          <p className="text-xs font-bold text-slate-900">
            {attendedCount}/{calledCount} presentes
          </p>
          <p className="text-[10px] text-slate-400">{percentage}% presença</p>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Fazer Chamada Button */}
          <button
            type="button"
            onClick={() => onOpenAttendance(meeting)}
            className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-full text-xs font-bold bg-[#163242] hover:bg-[#20445a] text-white transition-colors shadow-xs cursor-pointer"
            aria-label={`Fazer chamada da reunião de ${formattedDate}`}
          >
            <CheckSquare className="w-3.5 h-3.5 text-[#58bc75]" />
            <span>Chamada</span>
          </button>

          {/* Edit Button */}
          <button
            type="button"
            onClick={() => onEdit(meeting)}
            className="w-11 h-11 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            aria-label={`Editar reunião de ${formattedDate}`}
          >
            <Edit2 className="w-4 h-4" />
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => onDelete(meeting)}
            className="w-11 h-11 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
            aria-label={`Excluir reunião de ${formattedDate}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
