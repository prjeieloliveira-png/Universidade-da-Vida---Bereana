import type { ReportOptions } from '../types';

interface Option {
  value: string;
  label: string;
}

interface ReportOptionsPanelProps {
  options: ReportOptions;
  onChange: (patch: Partial<ReportOptions>) => void;
  sortOptions: Option[];
  groupOptions: Option[];
}

const fieldCls =
  'w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d7647] focus:bg-white text-slate-900';
const labelCls = 'block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1';

function Segmented({
  value,
  items,
  onChange,
  label,
}: {
  value: string;
  items: Option[];
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <div>
      <span className={labelCls}>{label}</span>
      <div className="grid grid-cols-2 gap-1.5">
        {items.map((it) => (
          <button
            key={it.value}
            type="button"
            onClick={() => onChange(it.value)}
            aria-pressed={value === it.value}
            className={`py-2 rounded-xl text-xs font-bold cursor-pointer border ${
              value === it.value
                ? 'bg-[#163242] text-white border-[#163242]'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {it.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ReportOptionsPanel({ options, onChange, sortOptions, groupOptions }: ReportOptionsPanelProps) {
  return (
    <div className="space-y-3.5">
      <div>
        <label htmlFor="report-title" className={labelCls}>Título</label>
        <input id="report-title" type="text" value={options.title} onChange={(e) => onChange({ title: e.target.value })} placeholder="Ex: Relação de alunos" className={fieldCls} />
      </div>
      <div>
        <label htmlFor="report-subtitle" className={labelCls}>Subtítulo</label>
        <input id="report-subtitle" type="text" value={options.subtitle} onChange={(e) => onChange({ subtitle: e.target.value })} placeholder="Opcional" className={fieldCls} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="report-sort" className={labelCls}>Ordenar por</label>
          <select id="report-sort" value={options.sortBy} onChange={(e) => onChange({ sortBy: e.target.value })} className={`${fieldCls} cursor-pointer`}>
            {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="report-group" className={labelCls}>Agrupar</label>
          <select id="report-group" value={options.groupBy} onChange={(e) => onChange({ groupBy: e.target.value })} className={`${fieldCls} cursor-pointer`}>
            {groupOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <Segmented
        label="Papel A4"
        value={options.orientation}
        onChange={(v) => onChange({ orientation: v as ReportOptions['orientation'] })}
        items={[{ value: 'portrait', label: 'Retrato' }, { value: 'landscape', label: 'Paisagem' }]}
      />
      <Segmented
        label="Densidade"
        value={options.density}
        onChange={(v) => onChange({ density: v as ReportOptions['density'] })}
        items={[{ value: 'normal', label: 'Normal' }, { value: 'compact', label: 'Compacta' }]}
      />

      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
        <input type="checkbox" checked={options.showRowNumbers} onChange={(e) => onChange({ showRowNumbers: e.target.checked })} className="w-4 h-4 accent-[#0d7647]" />
        Numerar as linhas
      </label>

      <div>
        <label htmlFor="report-footer" className={labelCls}>Observação no rodapé</label>
        <textarea id="report-footer" rows={2} value={options.footerNote} onChange={(e) => onChange({ footerNote: e.target.value })} placeholder="Opcional (ex.: responsável, assinatura)" className={`${fieldCls} resize-none`} />
      </div>
    </div>
  );
}
