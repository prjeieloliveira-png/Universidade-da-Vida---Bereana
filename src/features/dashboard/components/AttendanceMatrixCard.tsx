import { CheckCircle2, TrendingUp } from 'lucide-react';

interface AttendanceMatrixCardProps {
  averagePresence?: number;
  completedLessons?: number;
  totalLessons?: number;
}

export function AttendanceMatrixCard({
  averagePresence = 88,
  completedLessons = 2,
  totalLessons = 9,
}: AttendanceMatrixCardProps) {

  // Dot matrix columns representing student presence across classes
  const matrixColumns = [
    [1, 1, 1, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 1, 1, 0],
    [1, 1, 1, 1, 1],
    [1, 1, 0, 1, 1],
    [1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 1, 1, 1],
    [1, 1, 1, 1, 0],
  ];

  return (
    <div className="bg-white border border-slate-200/70 rounded-[28px] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      {/* Top Header Stat */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-full bg-[#163242] text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-[#58bc75]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {averagePresence}%
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e8f8ee] text-[#2b7f4a] border border-[#c5eed3]">
              <TrendingUp className="w-3 h-3" />
              +4.2%
            </span>
          </div>
        </div>
        <p className="text-xs font-medium text-slate-400">
          frequência média nas aulas realizadas
        </p>
      </div>

      {/* Visual Dot Matrix Chart */}
      <div className="my-5 flex items-end justify-between gap-1.5 px-1 py-2">
        {matrixColumns.map((col, colIdx) => (
          <div key={colIdx} className="flex flex-col gap-1.5 items-center">
            {col.map((val, rowIdx) => (
              <span
                key={rowIdx}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  val === 1
                    ? 'bg-[#163242] opacity-90'
                    : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Bottom Sub-indicator */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="font-semibold text-slate-700">
          {completedLessons} de {totalLessons} aulas realizadas
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#163242]" />
          <span className="text-[11px]">Presente</span>
          <span className="w-2 h-2 rounded-full bg-slate-200 ml-1" />
          <span className="text-[11px]">Falta</span>
        </div>
      </div>
    </div>
  );
}
