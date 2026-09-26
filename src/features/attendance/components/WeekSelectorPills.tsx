import { useState } from 'react';
import { Calendar, Sparkles, Pencil } from 'lucide-react';
import { WeekNumber, LESSON_WEEKS, LessonWeekInfo } from '../types';
import { useLessonStore } from '../store/lessonStore';
import { useLessonsSync } from '../hooks/useLessonsSync';
import { EditLessonThemeModal } from './EditLessonThemeModal';

interface WeekSelectorPillsProps {
  activeWeek: WeekNumber;
  onSelectWeek: (week: WeekNumber) => void;
}

export function WeekSelectorPills({ activeWeek, onSelectWeek }: WeekSelectorPillsProps) {
  const { lessons } = useLessonStore();
  const { saveLesson, isSavingLesson, saveLessonError } = useLessonsSync();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fallbackLesson: LessonWeekInfo = LESSON_WEEKS[0] ?? {
    number: 1,
    key: 's1',
    title: 'Semana 1',
    theme: 'O Encontro com Deus',
    dateStr: '07 de Março',
  };
  const currentLesson: LessonWeekInfo =
    lessons.find((l) => l.number === activeWeek) ?? lessons[0] ?? fallbackLesson;


  return (
    <div className="bg-white border border-slate-200/80 rounded-[28px] p-4 sm:p-5 shadow-xs space-y-3.5">
      {/* 9 Weeks Navigation Bar (Horizontal scroll with touch-friendly pills) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Semanas de Aulas (9 no Total)
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            Ativa: <strong>Semana {activeWeek}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
          {lessons.map((lesson) => {
            const isActive = lesson.number === activeWeek;
            const isDefined = lesson.theme !== 'A Definir';
            return (
              <button
                key={lesson.number}
                onClick={() => onSelectWeek(lesson.number)}
                className={`py-2 px-3 sm:px-4 rounded-2xl flex flex-col items-center sm:items-start text-left transition-all cursor-pointer shrink-0 snap-start min-w-[76px] sm:min-w-[105px] ${
                  isActive
                    ? 'bg-[#163242] text-white shadow-md ring-2 ring-[#58bc75]/50 scale-[1.02]'
                    : 'bg-slate-50 border border-slate-200/70 text-slate-700 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-0.5 gap-1.5">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-[#58bc75] text-[#0d222e]'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    S{lesson.number}
                  </span>
                  <span
                    className={`text-[10px] truncate ${
                      isActive ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    {lesson.dateStr.split(' ')[0]}
                  </span>
                </div>
                <h4 className="text-xs font-bold truncate w-full">
                  {lesson.title}
                </h4>
                <p
                  className={`text-[10px] truncate w-full ${
                    isActive
                      ? isDefined ? 'text-[#58bc75]' : 'text-amber-300 italic'
                      : isDefined ? 'text-slate-500' : 'text-slate-400 italic'
                  }`}
                >
                  {lesson.theme}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Week Theme Banner with Edit Theme Trigger */}
      <div className="bg-gradient-to-r from-[#e8f8ee] to-[#d8ede1] border border-[#c4e3d0] rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#58bc75] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
            S{currentLesson.number}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#20693a] uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-[#2e844b]" />
                Chamada Oficial • {currentLesson.title}
              </span>
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#2e844b]" />
                {currentLesson.dateStr}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight truncate">
              {currentLesson.theme}
            </h3>
          </div>
        </div>

        {/* Action Button: Definir / Editar Tema */}
        <button
          onClick={() => setIsEditModalOpen(true)}
          className={`self-start sm:self-auto px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0 ${
            currentLesson.theme === 'A Definir'
              ? 'bg-[#163242] text-white hover:bg-[#1f4358] ring-2 ring-[#58bc75]'
              : 'bg-white/90 hover:bg-white text-slate-700 border border-[#c4e3d0]'
          }`}
          title="Editar tema e data desta aula"
        >
          <Pencil className="w-3.5 h-3.5 text-[#2e844b]" />
          <span>{currentLesson.theme === 'A Definir' ? 'Definir Tema' : 'Editar Tema'}</span>
        </button>
      </div>

      {/* Modal for editing lesson theme */}
      <EditLessonThemeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        lesson={currentLesson}
        onSave={(updates) => saveLesson(currentLesson.number, updates)}
        isSaving={isSavingLesson}
        saveError={saveLessonError instanceof Error ? saveLessonError.message : null}
      />
    </div>
  );
}

