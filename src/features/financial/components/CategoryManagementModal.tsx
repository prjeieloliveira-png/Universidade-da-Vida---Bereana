import React, { useState } from 'react';
import { X, Plus, Trash2, Tag } from 'lucide-react';
import type { CashCategory } from '../types';

interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CashCategory[];
  onAddCategory: (name: string, type: 'in' | 'out') => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

export function CategoryManagementModal({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onDeleteCategory,
}: CategoryManagementModalProps) {
  const [activeTab, setActiveTab] = useState<'out' | 'in'>('out');
  const [newCatName, setNewCatName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentCategories = categories.filter((c) => c.type === activeTab);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setErrorMsg(null);

    try {
      setIsSubmitting(true);
      await onAddCategory(newCatName.trim(), activeTab);
      setNewCatName('');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Falha ao adicionar categoria.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await onDeleteCategory(id);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Falha ao excluir categoria.');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-[28px] border border-slate-200/80 shadow-2xl max-w-lg w-full overflow-hidden my-auto flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#163242] text-white flex items-center justify-center shrink-0">
              <Tag className="w-5 h-5 text-[#58bc75]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Categorias Financeiras
              </h3>
              <p className="text-xs text-slate-400">
                Gerencie as categorias de receitas e despesas
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector: Despesas | Receitas */}
        <div className="p-4 border-b border-slate-100 bg-[#f8fafc]">
          <div className="bg-slate-200/70 p-1 rounded-xl flex items-center">
            <button
              type="button"
              onClick={() => setActiveTab('out')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'out'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Despesas (Saídas)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('in')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'in'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Receitas (Entradas)
            </button>
          </div>
        </div>

        {/* Add Category Form */}
        <div className="p-4 sm:p-5 border-b border-slate-100">
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              required
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder={activeTab === 'out' ? 'Nova despesa (ex: Aluguel de Sítio)' : 'Nova receita (ex: Doação Externa)'}
              className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d7647] focus:bg-white text-slate-900 transition-all"
            />
            <button
              type="submit"
              disabled={isSubmitting || !newCatName.trim()}
              className="px-4 py-2 bg-[#0d7647] hover:bg-[#095a36] disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar</span>
            </button>
          </form>
          {errorMsg && (
            <p className="text-xs text-rose-600 font-semibold mt-2">{errorMsg}</p>
          )}
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2">
          {currentCategories.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              Nenhuma categoria encontrada para este tipo.
            </div>
          ) : (
            currentCategories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      cat.type === 'in' ? 'bg-[#0d7647]' : 'bg-rose-500'
                    }`}
                  />
                  <span className="text-xs sm:text-sm font-semibold text-slate-800">
                    {cat.name}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(cat.id)}
                  className="w-7 h-7 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                  title="Excluir categoria"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold bg-[#163242] text-white rounded-xl hover:bg-[#1f4358] transition-colors cursor-pointer"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
}
