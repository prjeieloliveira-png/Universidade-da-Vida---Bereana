import { useState } from 'react';
import { Save, Trash2 } from 'lucide-react';
import type { ReportPreset } from '../types';

interface ReportPresetsBarProps<F> {
  presets: ReportPreset<F>[];
  onApply: (preset: ReportPreset<F>) => void;
  onSave: (name: string) => void;
  onDelete: (id: string) => void;
}

export function ReportPresetsBar<F>({ presets, onApply, onSave, onDelete }: ReportPresetsBarProps<F>) {
  const [selectedId, setSelectedId] = useState('');
  const [name, setName] = useState('');

  const handleSelect = (id: string) => {
    setSelectedId(id);
    const preset = presets.find((p) => p.id === id);
    if (preset) {
      onApply(preset);
      setName(preset.name);
    }
  };

  return (
    <div className="space-y-2.5">
      <div>
        <label htmlFor="report-preset" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
          Modelos salvos
        </label>
        <div className="flex items-center gap-2">
          <select
            id="report-preset"
            value={selectedId}
            onChange={(e) => handleSelect(e.target.value)}
            className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 cursor-pointer"
          >
            <option value="">{presets.length === 0 ? 'Nenhum modelo salvo' : 'Escolher um modelo...'}</option>
            {presets.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button
            type="button"
            disabled={!selectedId}
            onClick={() => {
              onDelete(selectedId);
              setSelectedId('');
            }}
            aria-label="Excluir modelo"
            className="w-9 h-9 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-600 disabled:opacity-30 flex items-center justify-center cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do modelo"
          aria-label="Nome do modelo"
          className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d7647] text-slate-900"
        />
        <button
          type="button"
          disabled={!name.trim()}
          onClick={() => {
            onSave(name);
            setSelectedId('');
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-40 cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          Salvar modelo
        </button>
      </div>
      <p className="text-[11px] text-slate-400">
        O modelo guarda colunas, opções de página e filtros, e fica neste navegador.
      </p>
    </div>
  );
}
