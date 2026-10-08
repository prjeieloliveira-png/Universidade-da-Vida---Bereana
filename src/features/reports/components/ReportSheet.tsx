import type { ReportColumn, ReportGroup, ReportOptions } from '../types';
import '../report-print.css';

interface ReportSheetProps<T> {
  title: string;
  subtitle?: string;
  filtersSummary: string;
  issuedBy: string;
  issuedAt: Date;
  columns: ReportColumn<T>[];
  groups: ReportGroup<T>[];
  options: Pick<ReportOptions, 'orientation' | 'density' | 'showRowNumbers' | 'footerNote'>;
  totalLabel: string;
}

const alignCls = { left: 'text-left', center: 'text-center', right: 'text-right' } as const;

export function ReportSheet<T>({
  title,
  subtitle,
  filtersSummary,
  issuedBy,
  issuedAt,
  columns,
  groups,
  options,
  totalLabel,
}: ReportSheetProps<T>) {
  const compact = options.density === 'compact';
  const cellCls = compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1.5 text-xs';
  const colCount = columns.length + (options.showRowNumbers ? 1 : 0);
  const starts = groups.reduce<number[]>((acc, _g, i) => {
    acc.push((acc[i - 1] ?? 0) + (groups[i - 1]?.rows.length ?? 0));
    return acc;
  }, []);

  return (
    <div
      className="report-sheet bg-white text-slate-900 shadow-md border border-slate-200 mx-auto"
      style={{ width: options.orientation === 'portrait' ? '210mm' : '297mm', padding: '12mm' }}
    >
      <header className="flex items-start justify-between gap-4 pb-3 border-b-2 border-[#163242] mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <img src="/logo-uv-mark.png" alt="Universidade da Vida" className="w-10 h-11 object-contain shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#20693a]">
              Igreja Bereana • Universidade da Vida
            </p>
            <h1 className="text-lg font-black text-slate-900 leading-tight">{title || 'Relatório'}</h1>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
        </div>
        <div className="text-right text-[10px] text-slate-500 shrink-0">
          <p>Emitido em {issuedAt.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</p>
          {issuedBy && <p>por {issuedBy}</p>}
        </div>
      </header>

      {filtersSummary && (
        <p className="text-[10px] text-slate-500 mb-2">
          <strong className="text-slate-700">Filtros:</strong> {filtersSummary}
        </p>
      )}

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-slate-100 text-slate-700 font-bold border-y border-slate-300">
            {options.showRowNumbers && <th className={`${cellCls} text-center w-8`}>#</th>}
            {columns.map((c) => (
              <th key={c.id} className={`${cellCls} ${alignCls[c.align ?? 'left']}`}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groups.map((group, index) => (
            <GroupRows
              key={group.key}
              group={group}
              columns={columns}
              colCount={colCount}
              cellCls={cellCls}
              showRowNumbers={options.showRowNumbers}
              startNumber={starts[index] ?? 0}
            />
          ))}
          {groups.every((g) => g.rows.length === 0) && (
            <tr>
              <td colSpan={colCount} className="py-6 text-center text-xs text-slate-400">
                Nenhum registro para os filtros selecionados.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <footer className="mt-3 pt-2 border-t border-slate-300 text-[10px] text-slate-500 flex justify-between gap-4">
        <span className="font-bold text-slate-700">{totalLabel}</span>
        {options.footerNote && <span className="text-right whitespace-pre-line">{options.footerNote}</span>}
      </footer>
    </div>
  );
}

interface GroupRowsProps<T> {
  group: ReportGroup<T>;
  columns: ReportColumn<T>[];
  colCount: number;
  cellCls: string;
  showRowNumbers: boolean;
  startNumber: number;
}

function GroupRows<T>({ group, columns, colCount, cellCls, showRowNumbers, startNumber }: GroupRowsProps<T>) {
  return (
    <>
      {group.label && (
        <tr className="report-group-row bg-slate-50">
          <td colSpan={colCount} className={`${cellCls} font-extrabold text-[#163242]`}>
            {group.label} <span className="font-semibold text-slate-400">({group.rows.length})</span>
          </td>
        </tr>
      )}
      {group.rows.map((row, i) => (
        <tr key={i} className="border-b border-slate-200">
          {showRowNumbers && <td className={`${cellCls} text-center text-slate-400`}>{startNumber + i + 1}</td>}
          {columns.map((c) => (
            <td key={c.id} className={`${cellCls} ${alignCls[c.align ?? 'left']} ${c.nowrap ? 'whitespace-nowrap' : ''}`}>
              {c.value(row)}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
