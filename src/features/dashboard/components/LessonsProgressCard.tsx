import { useState, useMemo } from 'react';
import { Calendar, ArrowUpRight, CheckSquare, TrendingUp } from 'lucide-react';
import { useStudentStore } from '@/features/registrations/store/studentStore';
import { useCohortStore } from '@/features/cohorts/store/cohortStore';
import { useLessonStore } from '@/features/attendance/store/lessonStore';
import { LESSON_WEEKS, type LessonWeekInfo } from '@/features/attendance/types';

interface LessonsProgressCardProps {
  onStartAttendance?: () => void;
}

export function LessonsProgressCard({ onStartAttendance }: LessonsProgressCardProps) {
  const { students } = useStudentStore();
  const { activeCohortId } = useCohortStore();
  const { lessons } = useLessonStore();
  const [viewMode, setViewMode] = useState<'aulas' | 'geral'>('aulas');
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);

  const cohortStudents = useMemo(() => {
    return students.filter((s) => (s.cohortId || 'turma-01') === activeCohortId);
  }, [students, activeCohortId]);

  const totalStudents = cohortStudents.length;
  const currentWeek: LessonWeekInfo = lessons.find((l) => l.number === 3) ?? lessons[0] ?? LESSON_WEEKS[0] ?? {
    number: 3, key: 's3', title: 'Semana 3', theme: 'Cura Interior e Perdão', dateStr: '21 de Março',
  };

  // Cálculo dinâmico das 9 semanas reais a partir dos alunos da turma
  const weeklyData = useMemo(() => {
    let peakWeekNumber = -1;
    let highestPercent = -1;

    const items = LESSON_WEEKS.map((lesson) => {
      const presentCount = cohortStudents.filter((s) => Boolean(s[lesson.key])).length;
      const percent = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;
      const hasOccurred = presentCount > 0;

      if (hasOccurred && percent > highestPercent) {
        highestPercent = percent;
        peakWeekNumber = lesson.number;
      }

      return { number: lesson.number, label: `S${lesson.number}`, theme: lesson.theme, presentCount, percent, hasOccurred };
    });

    return items.map((w) => {
      const isPeak = w.number === peakWeekNumber && w.percent > 0;
      const badge = isPeak ? `${w.percent}%` : undefined;
      return { ...w, isPeak, badge };
    });
  }, [cohortStudents, totalStudents]);

  const completedWeeks = weeklyData.filter((w) => w.hasOccurred);
  const averagePresence = completedWeeks.length > 0
    ? Math.round(completedWeeks.reduce((acc, w) => acc + w.percent, 0) / completedWeeks.length)
    : 0;

  const hoveredItem = weeklyData.find((w) => w.number === hoveredWeek);

  return (
    <div className="bg-white border border-slate-200/70 rounded-[28px] p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
      {/* Header com Título, Alternador de Modo e Link */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#e8f7ee] text-[#0d7647] flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Taxa de Frequência</h3>
            <p className="text-xs text-slate-400 font-medium transition-colors">
              {viewMode === 'aulas'
                ? hoveredItem
                  ? `${hoveredItem.label}: ${hoveredItem.percent}% (${hoveredItem.presentCount}/${totalStudents} presentes)`
                  : 'Presença real das 9 semanas'
                : `Média de ${averagePresence}% nas aulas concluídas`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-[#f4f6f8] border border-slate-200/70 p-1 rounded-full flex items-center">
            <button
              type="button"
              onClick={() => setViewMode('geral')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'geral' ? 'bg-[#0d7647] text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Geral
            </button>
            <button
              type="button"
              onClick={() => setViewMode('aulas')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'aulas' ? 'bg-[#0d7647] text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'
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

      {/* Conteúdo Principal do Gráfico */}
      {viewMode === 'aulas' ? (
        <div className="py-2">
          <div className="flex items-end gap-1.5 sm:gap-3 h-44 sm:h-48 pt-6 pb-2">
            {/* Eixo Y */}
            <div className="flex flex-col justify-between h-full text-[10px] text-slate-400 font-semibold pr-1 shrink-0 pb-6 select-none">
              <span>100%</span>
              <span>80%</span>
              <span>60%</span>
              <span>40%</span>
              <span>20%</span>
              <span>0</span>
            </div>

            {/* As 9 Barras Semanais com Hover Interativo */}
            <div className="flex-1 grid grid-cols-9 gap-1 sm:gap-2 h-full items-end">
              {weeklyData.map((item) => {
                const isHovered = hoveredWeek === item.number;
                const showBadge = isHovered || (item.isPeak && hoveredWeek === null);

                return (
                  <div
                    key={item.label}
                    onMouseEnter={() => setHoveredWeek(item.number)}
                    onMouseLeave={() => setHoveredWeek(null)}
                    onClick={() => setHoveredWeek(hoveredWeek === item.number ? null : item.number)}
                    className="flex flex-col items-center justify-end h-full gap-2 relative group cursor-pointer"
                  >
                    {/* Badge Flutuante (70% no pico ou % da semana focada) */}
                    {showBadge && (
                      <div className={`absolute -top-6 flex flex-col items-center z-20 pointer-events-none transition-all duration-200 ${item.isPeak && !isHovered ? 'animate-bounce duration-1000' : 'scale-105'}`}>
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-[#0d7647] text-white shadow-xs whitespace-nowrap">
                          {item.hasOccurred ? `${item.percent}%` : '0%'}
                        </span>
                        <span className="w-1.5 h-1.5 rotate-45 bg-[#0d7647] -mt-0.5" />
                      </div>
                    )}

                    {/* Barra Vertical */}
                    <div
                      style={{ height: `${item.hasOccurred ? Math.max(item.percent, 8) : 6}%` }}
                      className={`w-full max-w-[28px] rounded-full transition-all duration-200 ${
                        item.isPeak
                          ? 'bg-[#0d7647] shadow-sm shadow-[#0d7647]/30 ring-2 ring-[#0d7647]/20'
                          : item.hasOccurred
                          ? 'striped-sage-bar opacity-90 group-hover:opacity-100'
                          : 'bg-slate-100 border border-dashed border-slate-200/80 opacity-60'
                      } ${isHovered ? 'ring-2 ring-[#0d7647]/50 scale-x-105' : ''}`}
                      title={
                        item.hasOccurred
                          ? `${item.label} (${item.theme}): ${item.percent}% (${item.presentCount}/${totalStudents} presentes)`
                          : `${item.label}: Aula futura (não realizada)`
                      }
                    />

                    {/* Rótulo da Semana */}
                    <span
                      className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-tight transition-colors ${
                        isHovered ? 'text-slate-900 scale-105' : item.hasOccurred ? 'text-slate-600' : 'text-slate-300'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Visão Geral Consolidada */
        <div className="py-4 flex flex-col justify-center gap-3.5 h-44 sm:h-48">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#f4fbf6] border border-[#bde7cb]">
            <div className="w-12 h-12 rounded-2xl bg-[#0d7647] text-white flex items-center justify-center font-black text-xl shrink-0 shadow-xs">
              {averagePresence}%
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">Engajamento Médio</h4>
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#0d7647] border border-[#c4e8d2]">
                  <TrendingUp className="w-3 h-3" /> Alta Assiduidade
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculado com base em {completedWeeks.length} encontros realizados da {currentWeek.title}.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            {completedWeeks.map((w) => (
              <div key={w.label} className="p-2.5 bg-slate-50 border border-slate-200/70 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 block mb-0.5 uppercase">
                  {w.label} • {w.theme}
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-base font-extrabold text-slate-900">{w.percent}%</span>
                  <span className="text-slate-500 font-medium">{w.presentCount}/{totalStudents} presentes</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rodapé: Próximo Encontro com Botão de Ação */}
      <div className="pt-3 mt-1 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
