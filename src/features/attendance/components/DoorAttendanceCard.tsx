import { Check, X } from 'lucide-react';
import type { StudentRecord } from '@/features/registrations/types';
import type { WeekNumber, WeekKey } from '../types';
import { useStudentPhotoUrl } from '@/shared/hooks/useStudentPhotoUrl';

interface DoorAttendanceCardProps {
  student: StudentRecord;
  activeWeek: WeekNumber;
  onSelectAction: (student: StudentRecord, action: 'PRESENTE' | 'FALTA') => void;
}

export function DoorAttendanceCard({
  student,
  activeWeek,
  onSelectAction,
}: DoorAttendanceCardProps) {
  const currentKey = `s${activeWeek}` as WeekKey;
  const isPresent = Boolean(student[currentKey]);
  const photoSrc = useStudentPhotoUrl(student.photoUrl);

  return (
    <div
      className={`border rounded-2xl p-4 transition-all shadow-xs flex flex-col gap-3 ${
        isPresent
          ? 'bg-emerald-50/50 border-emerald-200/90'
          : 'bg-white border-slate-200/90 hover:border-slate-300'
      }`}
    >
      {/* Top: Student Header & Info */}
      <div className="flex items-start gap-3 min-w-0">
        {/* Avatar / Photo */}
        {photoSrc ? (
          <img
            src={photoSrc}
            alt={student.name}
            className="w-11 h-11 rounded-full object-cover shrink-0 border border-slate-200 shadow-2xs"
          />
        ) : (
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-black text-xs shadow-2xs ${
              isPresent
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            {student.name.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Student Details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-black text-slate-900 truncate leading-snug">
              {student.name}
            </h4>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                isPresent
                  ? 'bg-emerald-100 text-emerald-800 font-extrabold'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {isPresent ? '✓ Presente' : '✕ Falta'}
            </span>
          </div>

          <p className="text-[11px] text-slate-500 truncate mt-0.5">
            <span className="font-semibold text-slate-700">{student.pastor}</span>
            {student.g12 && <span> • G12: {student.g12}</span>}
          </p>
        </div>
      </div>

      {/* Bottom: Fast Action Buttons for the Door Collaborator */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100/80">
        {/* Button Presença */}
        <button
          type="button"
          onClick={() => onSelectAction(student, 'PRESENTE')}
          className={`min-h-[44px] py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.98] ${
            isPresent
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs ring-2 ring-emerald-600/30'
              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80'
          }`}
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{isPresent ? 'Presente (Já marcado)' : 'Marcar Presente'}</span>
        </button>

        {/* Button Falta */}
        <button
          type="button"
          onClick={() => onSelectAction(student, 'FALTA')}
          className={`min-h-[44px] py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.98] ${
            !isPresent
              ? 'bg-rose-50 text-rose-800 border border-rose-200/80'
              : 'bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200/70'
          }`}
        >
          <X className="w-4 h-4 stroke-[2.5]" />
          <span>{!isPresent ? 'Falta (Já marcado)' : 'Marcar Falta'}</span>
        </button>
      </div>
    </div>
  );
}
