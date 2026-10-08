import { ArrowDown, ArrowUp } from 'lucide-react';
import type { ReportColumn } from '../types';

interface ReportColumnPickerProps<T> {
  columns: ReportColumn<T>[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
}

export function ReportColumnPicker<T>({ columns, selectedIds, onToggle, onMove }: ReportColumnPickerProps<T>) {
  const selected = selectedIds
    .map((id) => columns.find((c) => c.id === id))
    .filter((c): c is ReportColumn<T> => Boolean(c));
  const available = columns.filter((c) => !selectedIds.includes(c.id));

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          No relatório ({selected.length}) — na ordem em que aparecem
        </p>
        {selected.length === 0 ? (
          <p className="text-xs text-rose-600 font-semibold">Marque ao menos uma coluna.</p>
        ) : (
          <ul className="space-y-1">
            {selected.map((c, i) => (
              <li key={c.id} className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1.5">
                <input
                  id={`col-${c.id}`}
                  type="checkbox"
                  checked
                  onChange={() => onToggle(c.id)}
                  className="w-4 h-4 accent-[#0d7647] cursor-pointer"
                />
                <label htmlFor={`col-${c.id}`} className="flex-1 text-xs font-semibold text-slate-800 cursor-pointer">
                  {c.label}
                  {c.restricted && <span className="ml-1.5 text-[10px] font-bold text-amber-700">restrito</span>}
                </label>
                <button
                  type="button"
                  onClick={() => onMove(c.id, -1)}
                  disabled={i === 0}
                  aria-label={`Mover ${c.label} para cima`}
                  className="w-7 h-7 rounded-full hover:bg-slate-200 text-slate-500 disabled:opacity-30 flex items-center justify-center cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onMove(c.id, 1)}
                  disabled={i === selected.length - 1}
                  aria-label={`Mover ${c.label} para baixo`}
                  className="w-7 h-7 rounded-full hover:bg-slate-200 text-slate-500 disabled:opacity-30 flex items-center justify-center cursor-pointer"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {available.length > 0 && (
        <div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Disponíveis</p>
          <div className="flex flex-wrap gap-1.5">
            {available.map((c) => (
              <label
                key={c.id}
                htmlFor={`col-${c.id}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                <input
                  id={`col-${c.id}`}
                  type="checkbox"
                  checked={false}
                  onChange={() => onToggle(c.id)}
                  className="w-3.5 h-3.5 accent-[#0d7647] cursor-pointer"
                />
                {c.label}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
