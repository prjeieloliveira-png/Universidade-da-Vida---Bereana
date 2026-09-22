import { CheckSquare, ChevronRight } from 'lucide-react';
import { useLessonStore } from '@/features/attendance/store/lessonStore';
import { LESSON_WEEKS, LessonWeekInfo } from '@/features/attendance/types';

interface LessonsProgressCardProps {
  onStartAttendance?: () => void;
}

export function LessonsProgressCard({ onStartAttendance }: LessonsProgressCardProps) {
  const { lessons } = useLessonStore();
  // We assume weeks 1 and 2 are done, week 3 is current, weeks 4-9 are upcoming
  const fallbackLesson: LessonWeekInfo = LESSON_WEEKS[0] ?? {
    number: 1,
    key: 's1',
    title: 'Semana 1',
    theme: 'O Encontro com Deus',
    dateStr: '07 de Março',
  };
  const currentWeek: LessonWeekInfo = lessons.find((l) => l.number === 3) ?? lessons[0] ?? fallbackLesson;

  return (
    <div className="bg-white border border-slate-200/70 rounded-[28px] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Cronograma 2026 (9 Semanas)
          </span>
          <h3 className="text-base font-bold text-slate-800 tracking-tight">
            Aulas & Encontros
          </h3>
        </div>
        <button
          onClick={onStartAttendance}
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
          title="Ver aulas"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Middle Action / Status */}
      <div className="my-2 bg-[#f8fafc] border border-slate-100 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#e8f8ee] text-[#2e844b] flex items-center justify-center font-bold text-xs shrink-0">
            S{currentWeek.number}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-800 truncate">
              {currentWeek.title}: {currentWeek.theme}
            </h4>
            <p className="text-[11px] text-slate-400">Próximo Sábado • {currentWeek.dateStr}</p>
          </div>
        </div>

        <button
          onClick={onStartAttendance}
          className="self-start sm:self-auto px-3.5 py-1.5 bg-[#163242] hover:bg-[#1d3f54] text-white rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
        >
          <CheckSquare className="w-3.5 h-3.5 text-[#58bc75]" />
          <span>Fazer Chamada</span>
        </button>
      </div>

      {/* Rounded Progress Bars (9 weekly lessons) */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="flex items-end justify-between gap-1 sm:gap-1.5 h-16 px-1 mb-2">
          {lessons.map((lesson) => {
            const isDone = lesson.number < 3;
            const isCurrent = lesson.number === 3;
            const height = isDone ? 'h-14' : isCurrent ? 'h-10' : 'h-6';

            return (
              <div key={lesson.number} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                <div
                  className={`w-full max-w-[20px] sm:max-w-[24px] rounded-full transition-all ${height} ${
                    isDone
                      ? 'bg-[#58bc75]'
                      : isCurrent
                      ? 'bg-[#163242]'
                      : 'bg-slate-200'
                  }`}
                  title={`${lesson.title}: ${lesson.theme}`}
                />
                <span className="text-[9px] sm:text-[10px] font-medium text-slate-500 truncate">
                  S{lesson.number}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-3 sm:gap-4 text-[10px] sm:text-[11px] text-slate-400 pt-1">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#58bc75]" />
            <span>Concluída</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#163242]" />
            <span>Atual</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-200" />
            <span>Pendente</span>
          </div>
        </div>
      </div>
    </div>
  );
}
