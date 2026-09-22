import { Check, X } from 'lucide-react';
import type { StudentRecord } from '@/features/registrations/types';
import type { WeekNumber, WeekKey } from '../types';

interface AttendanceStudentRowProps {
  student: StudentRecord;
  activeWeek: WeekNumber;
  onToggle: (studentId: string, week: WeekNumber) => void;
}

const WEEKS: WeekNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export function AttendanceStudentRow({
  student,
  activeWeek,
  onToggle,
}: AttendanceStudentRowProps) {
  const currentKey = `s${activeWeek}` as WeekKey;
  const isPresentInActiveWeek = Boolean(student[currentKey]);

  // Calculate total attended out of 9
  const totalAttended = [
    student.s1,
    student.s2,
    student.s3,
    student.s4,
    student.s5,
    student.s6,
    student.s7,
    student.s8,
    student.s9,
  ].filter(Boolean).length;

  return (
    <div
      className={`border rounded-[22px] p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-all ${
        isPresentInActiveWeek
          ? 'bg-[#f4fbf6] border-[#bde7cb] hover:border-[#96dcad]'
          : 'bg-white border-slate-200/90 hover:border-slate-300'
      }`}
    >
      {/* Left: Number, Name, Phone & Leadership */}
      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
        <span
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-colors shadow-2xs mt-0.5 sm:mt-0 ${
            isPresentInActiveWeek ? 'bg-[#207a41] text-white' : 'bg-slate-200 text-slate-700'
          }`}
        >
          {student.num}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4
              className={`text-sm sm:text-base font-bold truncate tracking-tight ${
                isPresentInActiveWeek ? 'text-slate-900' : 'text-slate-700'
              }`}
            >
              {student.name}
            </h4>
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {totalAttended}/9 Presenças
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate mt-0.5">
            {student.phone !== '—' && <span className="text-slate-500 font-medium">{student.phone} • </span>}
            {student.pastor} • G12: {student.g12}
            {student.leader && student.leader !== student.g12 ? ` • Líder: ${student.leader}` : ''}
          </p>
        </div>
      </div>

      {/* Right: 9-Weeks Pills & Active Week Toggle Button */}
      <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        {/* 9-Weeks Micro Pills (S1 to S9) with smooth touch scroll on mobile */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 overflow-x-auto max-w-[210px] sm:max-w-none scrollbar-none">
          {WEEKS.map((w) => {
            const isWeekPresent = Boolean(student[`s${w}`]);
            const isCurrentWeek = w === activeWeek;
            return (
              <button
                key={w}
                type="button"
                title={`Semana ${w}: ${isWeekPresent ? 'Presente' : 'Falta'} (clique para alternar)`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(student.id, w);
                }}
                className={`w-7 h-7 rounded-lg text-[10px] font-black flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                  isWeekPresent
                    ? isCurrentWeek
                      ? 'bg-[#58bc75] text-white shadow-xs ring-1 ring-[#163242]'
                      : 'bg-[#58bc75] text-white shadow-2xs hover:bg-[#4caa68]'
                    : isCurrentWeek
                    ? 'bg-white text-slate-700 border-2 border-[#163242]'
                    : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-200/80 hover:border-slate-300'
                }`}
              >
                S{w}
              </button>
            );
          })}
        </div>

        {/* 1-Click Main Status Button (Presente / Falta na semana ativa) */}
        <button
          type="button"
          title={`Alternar presença na Semana ${activeWeek}`}
          onClick={() => onToggle(student.id, activeWeek)}
          className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0 ${
            isPresentInActiveWeek
              ? 'bg-[#58bc75] hover:bg-[#4caa68] active:bg-[#3f9a5a] text-white ring-2 ring-[#58bc75]/25'
              : 'bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 border border-rose-200/80'
          }`}
        >
          {isPresentInActiveWeek ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Presente</span>
            </>
          ) : (
            <>
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Falta</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}



