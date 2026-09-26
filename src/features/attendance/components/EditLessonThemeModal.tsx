import React, { useState, useEffect } from 'react';
import { X, Save, Sparkles, Calendar, BookOpen, Loader2, AlertCircle } from 'lucide-react';
import type { LessonWeekInfo } from '../types';

interface EditLessonThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: LessonWeekInfo;
  onSave: (updates: { title: string; theme: string; dateStr: string }) => Promise<unknown> | void;
  isSaving?: boolean;
  saveError?: string | null;
}

export function EditLessonThemeModal({
  isOpen,
  onClose,
  lesson,
  onSave,
  isSaving = false,
  saveError = null,
}: EditLessonThemeModalProps) {
  const [title, setTitle] = useState(lesson.title);
  const [theme, setTheme] = useState(lesson.theme);
  const [dateStr, setDateStr] = useState(lesson.dateStr);

  useEffect(() => {
    setTitle(lesson.title);
    setTheme(lesson.theme === 'A Definir' ? '' : lesson.theme);
    setDateStr(lesson.dateStr);
  }, [lesson, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave({
        title: title.trim() || `Semana ${lesson.number}`,
        theme: theme.trim() || 'A Definir',
        dateStr: dateStr.trim() || lesson.dateStr,
      });
      onClose();
    } catch {
      // Mantém o modal aberto; a mensagem de erro vem de saveError
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-[28px] shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col my-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#58bc75] text-white flex items-center justify-center font-black text-sm shadow-xs">
              S{lesson.number}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Definir Tema — {lesson.title}
              </h3>
              <p className="text-xs text-slate-400">Personalize o tema e a data do encontro</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200/70 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tema / Conteúdo da Aula *
            </label>
            <div className="relative">
              <Sparkles className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="Ex: O Espírito Santo, Restauração Familiar, etc."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#58bc75] focus:outline-none font-medium text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Título da Semana
            </label>
            <div className="relative">
              <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`Semana ${lesson.number}`}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#58bc75] focus:outline-none text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Data do Encontro
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                placeholder="Ex: 04 de Abril"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#58bc75] focus:outline-none text-slate-900"
              />
            </div>
          </div>

          {saveError && (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {saveError}
            </p>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-full text-xs font-bold text-white bg-[#58bc75] hover:bg-[#4caa68] active:bg-[#3f9a5a] flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? 'Salvando...' : 'Salvar Tema'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
