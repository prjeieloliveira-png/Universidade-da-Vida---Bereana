export interface ReportColumn<T> {
  id: string;
  label: string;
  value: (row: T) => string;
  align?: 'left' | 'center' | 'right';
  /** Colunas curtas (telefone, valores, datas) não quebram de linha. */
  nowrap?: boolean;
  /** Só aparece para coordenação e secretaria (dados sensíveis). */
  restricted?: boolean;
  defaultVisible?: boolean;
}

export interface ReportGroup<T> {
  key: string;
  label: string;
  rows: T[];
}

export interface ReportOptions {
  title: string;
  subtitle: string;
  footerNote: string;
  orientation: 'portrait' | 'landscape';
  density: 'compact' | 'normal';
  showRowNumbers: boolean;
  sortBy: string;
  groupBy: string;
}

/** Configuração salva (modelo): colunas visíveis na ordem, opções de página e filtros do relatório. */
export interface ReportPreset<F = unknown> {
  id: string;
  name: string;
  columnIds: string[];
  options: ReportOptions;
  filters: F;
}
