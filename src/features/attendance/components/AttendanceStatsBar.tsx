import { UserCheck, UserX, CheckCircle2, FileSpreadsheet } from 'lucide-react';

interface AttendanceStatsBarProps {
  totalCount: number;
  presentCount: number;
  absentCount: number;
  onMarkAllPresent?: () => void;
  onOpenReport?: () => void;
}

export function AttendanceStatsBar({
  totalCount,
  presentCount,
  absentCount,
  onMarkAllPresent,
  onOpenReport,
}: AttendanceStatsBarProps) {
  const presenceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  return (
    <div className="bg-white border border-slate-200/80 rounded-[28px] p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      {/* 3 Metric Mini Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 flex-1">
        {/* Total */}
        <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3 flex flex-col justify-between">
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase">
            Total Alunos
          </span>
          <span className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
            {totalCount}
          </span>
        </div>

        {/* Presentes */}
        <div className="bg-[#e8f8ee] border border-[#c4e3d0] rounded-2xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-semibold text-[#20693a] uppercase">
              Presentes
            </span>
            <UserCheck className="w-3.5 h-3.5 text-[#2e844b] hidden sm:block" />
          </div>
          <span className="text-lg sm:text-2xl font-black text-[#1a5b32] tracking-tight">
            {presentCount}
          </span>
        </div>

        {/* Faltas */}
        <div className="bg-rose-50/70 border border-rose-200/70 rounded-2xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-semibold text-rose-700 uppercase">
              Faltas
            </span>
            <UserX className="w-3.5 h-3.5 text-rose-600 hidden sm:block" />
          </div>
          <span className="text-lg sm:text-2xl font-black text-rose-700 tracking-tight">
            {absentCount}
          </span>
        </div>
      </div>

      {/* Actions & Frequency Rate */}
      <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end justify-between gap-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <span className="text-xs text-slate-500 font-medium">Frequência da Semana:</span>
          <span className="text-base sm:text-lg font-black text-[#2e844b]">
            {presenceRate}%
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenReport && (
            <button
              onClick={onOpenReport}
              className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#163242] hover:bg-[#1f4358] active:bg-[#122835] text-white flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#58bc75]" />
              <span>Relatório Completo</span>
            </button>
          )}

          {onMarkAllPresent && totalCount > 0 && (
            <button
              onClick={onMarkAllPresent}
              className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2e844b]" />
              <span>Todos Presentes</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

