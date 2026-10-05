import React from 'react';
import { Check, MessageCircle, X } from 'lucide-react';
import { formatPhone, getWhatsAppLink } from '@/shared/utils/phone';
import type { TeamMemberAttendanceItem } from '../types/teams';

interface MeetingAttendanceRowProps {
  member: TeamMemberAttendanceItem;
  onSelectAction: (member: TeamMemberAttendanceItem, action: 'PRESENTE' | 'FALTA') => void;
}

export const MeetingAttendanceRow: React.FC<MeetingAttendanceRowProps> = ({ member, onSelectAction }) => {
  const waLink = getWhatsAppLink(member.personPhone);
  return (
    <div
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

      <div className="flex items-center gap-2 shrink-0">
        <span
          title={
            member.present === null
              ? 'Ainda não registrado'
              : `${member.present ? 'Presente' : 'Falta'}${
                  member.markedByName ? ` • registrado por ${member.markedByName}` : ''
                }${member.note ? ` • ${member.note}` : ''}`
          }
          className={`w-7 h-7 rounded-lg text-[10px] font-black flex items-center justify-center select-none ${
            member.present === true
              ? 'bg-[#58bc75] text-white shadow-2xs'
              : member.present === false
              ? 'bg-rose-100 text-rose-700 border border-rose-200/80'
              : 'bg-white text-slate-300 border border-slate-200/80'
          }`}
        >
          {member.present === true ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : member.present === false ? 'F' : ''}
        </span>
        <button
          type="button"
          onClick={() => onSelectAction(member, 'PRESENTE')}
          className={`px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 ${
            member.present === true
              ? 'bg-[#58bc75] hover:bg-[#4caa68] text-white ring-2 ring-[#58bc75]/25'
              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80'
          }`}
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
          <span>Presente</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectAction(member, 'FALTA')}
          className={`px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 ${
            member.present === false
              ? 'bg-rose-600 hover:bg-rose-700 text-white ring-2 ring-rose-600/25'
              : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80'
          }`}
        >
          <X className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Falta</span>
        </button>
      </div>
    </div>
  );
};
