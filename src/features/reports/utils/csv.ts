import type { ReportColumn, ReportGroup } from '../types';

function escapeCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

/** CSV no padrão do Excel brasileiro: separador ";" e BOM UTF-8. */
export function buildCsv<T>(
  columns: ReportColumn<T>[],
  groups: ReportGroup<T>[],
  options: { groupLabel?: string; showRowNumbers?: boolean } = {}
): string {
  const hasGroups = groups.length > 1 || (groups[0] && groups[0].label !== '');
  const header = [
    ...(options.showRowNumbers ? ['#'] : []),
    ...(hasGroups ? [options.groupLabel ?? 'Grupo'] : []),
    ...columns.map((c) => c.label),
  ].map(escapeCell);

  let n = 0;
  const lines = groups.flatMap((group) =>
    group.rows.map((row) => {
      n += 1;
      return [
        ...(options.showRowNumbers ? [String(n)] : []),
        ...(hasGroups ? [group.label] : []),
        ...columns.map((c) => c.value(row)),
      ]
        .map(escapeCell)
        .join(';');
    })
  );

  return '﻿' + [header.join(';'), ...lines].join('\n');
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
