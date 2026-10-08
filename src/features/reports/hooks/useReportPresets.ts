import { useCallback, useState } from 'react';
import type { ReportOptions, ReportPreset } from '../types';

const storageKey = (reportKey: string) => `bereana_report_presets_v1_${reportKey}`;

function load<F>(reportKey: string): ReportPreset<F>[] {
  try {
    const raw = localStorage.getItem(storageKey(reportKey));
    return raw ? (JSON.parse(raw) as ReportPreset<F>[]) : [];
  } catch {
    return [];
  }
}

function persist<F>(reportKey: string, presets: ReportPreset<F>[]) {
  try {
    localStorage.setItem(storageKey(reportKey), JSON.stringify(presets));
  } catch {
    // sem espaço/permissão no armazenamento: o modelo vale só nesta sessão
  }
}

/** Modelos salvos (colunas, opções e filtros) guardados no navegador de cada usuário. */
export function useReportPresets<F>(reportKey: string) {
  const [presets, setPresets] = useState<ReportPreset<F>[]>(() => load<F>(reportKey));

  const savePreset = useCallback(
    (name: string, columnIds: string[], options: ReportOptions, filters: F) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      setPresets((prev) => {
        const existing = prev.find((p) => p.name.toLowerCase() === trimmed.toLowerCase());
        const preset: ReportPreset<F> = {
          id: existing?.id ?? `${Date.now()}`,
          name: trimmed,
          columnIds,
          options,
          filters,
        };
        const next = existing ? prev.map((p) => (p.id === existing.id ? preset : p)) : [...prev, preset];
        persist(reportKey, next);
        return next;
      });
    },
    [reportKey]
  );

  const deletePreset = useCallback(
    (id: string) => {
      setPresets((prev) => {
        const next = prev.filter((p) => p.id !== id);
        persist(reportKey, next);
        return next;
      });
    },
    [reportKey]
  );

  return { presets, savePreset, deletePreset };
}
