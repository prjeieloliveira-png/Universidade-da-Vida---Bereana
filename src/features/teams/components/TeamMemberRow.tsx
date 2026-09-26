import React from 'react';
import {
  MessageCircle,
  Phone,
  Edit2,
  ArrowRightLeft,
  UserX,
  UserCheck,
  Trash2,
} from 'lucide-react';
import { formatPhone, getWhatsAppLink, getTelLink } from '@/shared/utils/phone';
import { AttendanceBadge } from '@/shared/components/ui/AttendanceBadge';
import type { TeamMemberWithDetails } from '../types/teams';

interface TeamMemberRowProps {
  member: TeamMemberWithDetails;
  onEdit: (member: TeamMemberWithDetails) => void;
  onMove: (member: TeamMemberWithDetails) => void;
  onToggleActive: (member: TeamMemberWithDetails) => void;
  onDelete?: (member: TeamMemberWithDetails) => void;
}

export const TeamMemberRow: React.FC<TeamMemberRowProps> = ({
  member,
  onEdit,
  onMove,
  onToggleActive,
  onDelete,
}) => {
  const waLink = getWhatsAppLink(member.person.phone);
  const telLink = getTelLink(member.person.phone);

  return (
    <div
      data-testid={`team-member-row-${member.id}`}
      className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        member.active
          ? 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
          : 'bg-slate-50/70 border-dashed border-slate-300 opacity-75'
      }`}
    >
      {/* Left: Name, Badges & Notes */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-sm text-slate-900 truncate">
            {member.person.fullName}
          </span>

          {!member.active && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-200 text-slate-600">
              Inativo
            </span>
          )}

          <AttendanceBadge
            attended={member.attendance.attended}
            called={member.attendance.totalCalled}
            percentage={member.attendance.percentage}
            size="sm"
          />
        </div>

        {/* Phone & notes */}
        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
          <span className="font-mono text-slate-600 font-medium">
            {formatPhone(member.person.phone)}
          </span>

          {member.notes && (
            <span className="text-[11px] text-slate-400 italic truncate max-w-xs">
              • {member.notes}
            </span>
          )}
        </div>
      </div>

      {/* Right: Quick Action Buttons (Touch targets >= 44px) */}
      <div className="flex items-center gap-1 self-end sm:self-auto shrink-0">
        {/* WhatsApp Link */}
        {waLink && (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            title="Conversar no WhatsApp"
            className="w-11 h-11 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-colors cursor-pointer"
            aria-label={`Conversar com ${member.person.fullName} no WhatsApp`}
          >
            <MessageCircle className="w-4 h-4" />
          </a>
        )}

        {/* Phone Call Link */}
        {telLink && (
          <a
            href={telLink}
            title="Ligar para o telefone"
            className="w-11 h-11 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 flex items-center justify-center transition-colors cursor-pointer"
            aria-label={`Ligar para ${member.person.fullName}`}
          >
            <Phone className="w-4 h-4" />
          </a>
        )}

        {/* Edit Button */}
        <button
          type="button"
          onClick={() => onEdit(member)}
          title="Editar membro"
          className="w-11 h-11 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          aria-label={`Editar ${member.person.fullName}`}
        >
          <Edit2 className="w-4 h-4" />
        </button>

        {/* Move Team Button */}
        <button
          type="button"
          onClick={() => onMove(member)}
          title="Mover para outra equipe"
          className="w-11 h-11 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          aria-label={`Mover ${member.person.fullName} para outra equipe`}
        >
          <ArrowRightLeft className="w-4 h-4" />
        </button>

        {/* Toggle Active Button */}
        <button
          type="button"
          onClick={() => onToggleActive(member)}
          title={member.active ? 'Desativar membro' : 'Reativar membro'}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
            member.active
              ? 'hover:bg-rose-50 text-slate-400 hover:text-rose-600'
              : 'hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700'
          }`}
          aria-label={member.active ? 'Desativar membro' : 'Reativar membro'}
        >
          {member.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
        </button>

        {/* Delete Member Button (exibido apenas para membros inativos/ocultos) */}
        {!member.active && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(member)}
            title="Excluir membro da equipe"
            className="w-11 h-11 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
            aria-label={`Excluir ${member.person.fullName} da equipe`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
