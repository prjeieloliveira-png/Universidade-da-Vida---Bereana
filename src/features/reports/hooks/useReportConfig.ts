import { useCallback, useMemo, useState } from 'react';
import type { ReportColumn, ReportOptions } from '../types';

export const DEFAULT_REPORT_OPTIONS: ReportOptions = {
  title: '',
  subtitle: '',
  footerNote: '',
  orientation: 'portrait',
  density: 'normal',
  showRowNumbers: false,
  sortBy: 'name',
  groupBy: 'none',
};

/**
 * Estado de personalização de um relatório: colunas visíveis (na ordem escolhida) e opções de página.
 * `columns` já deve vir sem as colunas restritas que o usuário não pode ver.
 */
export function useReportConfig<T>(columns: ReportColumn<T>[], defaults: Partial<ReportOptions> = {}) {
  const defaultIds = useMemo(
    () => columns.filter((c) => c.defaultVisible).map((c) => c.id),
    [columns]
  );
  const [columnIds, setColumnIds] = useState<string[]>(defaultIds);
  const [options, setOptions] = useState<ReportOptions>({ ...DEFAULT_REPORT_OPTIONS, ...defaults });

  const validIds = useMemo(() => new Set(columns.map((c) => c.id)), [columns]);

  const visibleColumns = useMemo(
    () =>
      columnIds
        .filter((id) => validIds.has(id))
        .map((id) => columns.find((c) => c.id === id))
        .filter((c): c is ReportColumn<T> => Boolean(c)),
    [columnIds, columns, validIds]
  );

  const toggleColumn = useCallback((id: string) => {
    setColumnIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }, []);

  const moveColumn = useCallback((id: string, direction: -1 | 1) => {
    setColumnIds((prev) => {
      const i = prev.indexOf(id);
      const j = i + direction;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      const a = next[i] as string;
      next[i] = next[j] as string;
      next[j] = a;
      return next;
    });
  }, []);

  const updateOptions = useCallback((patch: Partial<ReportOptions>) => {
    setOptions((prev) => ({ ...prev, ...patch }));
  }, []);

  const applyConfig = useCallback(
    (nextColumnIds: string[], nextOptions: ReportOptions) => {
      setColumnIds(nextColumnIds.filter((id) => validIds.has(id)));
      setOptions({ ...DEFAULT_REPORT_OPTIONS, ...nextOptions });
    },
    [validIds]
  );

  const reset = useCallback(() => {
    setColumnIds(defaultIds);
    setOptions({ ...DEFAULT_REPORT_OPTIONS, ...defaults });
  }, [defaultIds]);

  return { columnIds, visibleColumns, options, toggleColumn, moveColumn, updateOptions, applyConfig, reset };
}
