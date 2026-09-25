import { useState } from 'react';
import { Calendar, ArrowUpRight, CheckSquare } from 'lucide-react';
import { useLessonStore } from '@/features/attendance/store/lessonStore';
import { LESSON_WEEKS, LessonWeekInfo } from '@/features/attendance/types';

interface LessonsProgressCardProps {
  onStartAttendance?: () => void;
}

export function LessonsProgressCard({ onStartAttendance }: LessonsProgressCardProps) {
  const { lessons } = useLessonStore();
  const [viewMode, setViewMode] = useState<'aulas' | 'mensal'>('aulas');

  const fallbackLesson: LessonWeekInfo = LESSON_WEEKS[0] ?? {
    number: 1,
    key: 's1',
    title: 'Semana 1',
    theme: 'O Encontro com Deus',
    dateStr: '07 de Março',
  };
  const currentWeek: LessonWeekInfo = lessons.find((l) => l.number === 3) ?? lessons[0] ?? fallbackLesson;

  // 6 weekly data points matching Quixotic reference bar chart
  const weeklyData = [
    { label: 'SEM 1', heightPercent: 45, isPeak: false },
    { label: 'SEM 2', heightPercent: 68, isPeak: false },
    { label: 'SEM 3', heightPercent: 55, isPeak: false },
    { label: 'SEM 4', heightPercent: 92, isPeak: true, badge: '+17.8%' },
    { label: 'SEM 5', heightPercent: 62, isPeak: false },
    { label: 'SEM 6', heightPercent: 58, isPeak: false },
  ];

  return (
    <div className="bg-white border border-slate-200/70 rounded-[28px] p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
      {/* Top Header: Title, Toggle and Arrow Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#e8f7ee] text-[#0d7647] flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Taxa de Frequência
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Presença e engajamento dos encontros
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quixotic Pill Toggle */}
          <div className="bg-[#f4f6f8] border border-slate-200/70 p-1 rounded-full flex items-center">
            <button
              type="button"
              onClick={() => setViewMode('mensal')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'mensal'
                  ? 'bg-[#0d7647] text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Geral
            </button>
            <button
              type="button"
              onClick={() => setViewMode('aulas')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'aulas'
                  ? 'bg-[#0d7647] text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Semanas
            </button>
          </div>

          <button
            type="button"
            onClick={onStartAttendance}
            className="w-8 h-8 rounded-full border border-slate-200/80 hover:bg-slate-50 active:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0 shadow-2xs"
            title="Ver frequência completa"
            aria-label="Ver frequência"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Quixotic Bar Chart Area */}
      <div className="py-2">
        <div className="flex items-end gap-2 sm:gap-4 h-44 sm:h-48 pt-6 pb-2">
          {/* Left Y-axis Scale */}
          <div className="flex flex-col justify-between h-full text-[10px] text-slate-400 font-semibold pr-1 shrink-0 pb-6">
            <span>100%</span>
            <span>80%</span>
            <span>60%</span>
            <span>40%</span>
            <span>20%</span>
            <span>0</span>
          </div>

          {/* Vertical Bars Container */}
          <div className="flex-1 grid grid-cols-6 gap-2 sm:gap-4 h-full items-end">
            {weeklyData.map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center justify-end h-full gap-2 relative group"
              >
                {/* Floating Pill Badge on Peak Bar (Quixotic style) */}
                {item.isPeak && item.badge && (
                  <div className="absolute -top-6 flex flex-col items-center animate-bounce duration-1000">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#0d7647] text-white shadow-xs">
                      {item.badge}
                    </span>
                    <span className="w-1.5 h-1.5 rotate-45 bg-[#0d7647] -mt-0.5" />
                  </div>
                )}

                {/* Vertical Bar */}
                <div
                  style={{ height: `${item.heightPercent}%` }}
                  className={`w-full max-w-[32px] sm:max-w-[42px] rounded-full transition-all duration-300 ${
                    item.isPeak
                      ? 'bg-[#0d7647] shadow-sm shadow-[#0d7647]/30 ring-2 ring-[#0d7647]/20'
                      : 'striped-sage-bar opacity-90 group-hover:opacity-100'
                  }`}
                  title={`${item.label}: ${item.heightPercent}% de presença`}
                />

                {/* X-axis Label */}
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Card Footer: Next Meeting Info with Action Button */}
      <div className="pt-3 mt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#e8f7ee] text-[#0d7647] flex items-center justify-center font-bold text-xs shrink-0">
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
          type="button"
          onClick={onStartAttendance}
          className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#0d7647] hover:bg-[#095a36] text-white flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer shrink-0"
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Fazer Chamada</span>
        </button>
      </div>
    </div>
  );
}
