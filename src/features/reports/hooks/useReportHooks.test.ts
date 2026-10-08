import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReportConfig, DEFAULT_REPORT_OPTIONS } from './useReportConfig';
import { useReportPresets } from './useReportPresets';
import type { ReportColumn } from '../types';

const cols: ReportColumn<{ a: string }>[] = [
  { id: 'a', label: 'A', value: (r) => r.a, defaultVisible: true },
  { id: 'b', label: 'B', value: () => 'b', defaultVisible: true },
  { id: 'c', label: 'C', value: () => 'c' },
];

describe('useReportConfig', () => {
  it('começa com as colunas padrão, alterna e reordena', () => {
    const { result } = renderHook(() => useReportConfig(cols));
    expect(result.current.visibleColumns.map((c) => c.id)).toEqual(['a', 'b']);

    act(() => result.current.toggleColumn('c'));
    expect(result.current.visibleColumns.map((c) => c.id)).toEqual(['a', 'b', 'c']);

    act(() => result.current.moveColumn('c', -1));
    expect(result.current.visibleColumns.map((c) => c.id)).toEqual(['a', 'c', 'b']);

    act(() => result.current.moveColumn('a', -1)); // já é o primeiro: não muda
    expect(result.current.visibleColumns[0]?.id).toBe('a');

    act(() => result.current.toggleColumn('a'));
    expect(result.current.visibleColumns.map((c) => c.id)).toEqual(['c', 'b']);
  });

  it('ignora colunas que não existem mais ao aplicar um modelo antigo', () => {
    const { result } = renderHook(() => useReportConfig(cols));
    act(() => result.current.applyConfig(['c', 'removida', 'a'], { ...DEFAULT_REPORT_OPTIONS, title: 'X' }));
    expect(result.current.visibleColumns.map((c) => c.id)).toEqual(['c', 'a']);
    expect(result.current.options.title).toBe('X');
  });
});

describe('useReportPresets', () => {
  beforeEach(() => localStorage.clear());

  it('salva, sobrescreve pelo nome, persiste e exclui', () => {
    const { result, unmount } = renderHook(() => useReportPresets<{ q: string }>('t'));
    act(() => result.current.savePreset('Meu modelo', ['a'], DEFAULT_REPORT_OPTIONS, { q: '1' }));
    act(() => result.current.savePreset('meu modelo', ['a', 'b'], DEFAULT_REPORT_OPTIONS, { q: '2' }));
    expect(result.current.presets).toHaveLength(1);
    expect(result.current.presets[0]?.columnIds).toEqual(['a', 'b']);
    unmount();

    const again = renderHook(() => useReportPresets<{ q: string }>('t'));
    expect(again.result.current.presets[0]?.filters).toEqual({ q: '2' });

    act(() => again.result.current.deletePreset(again.result.current.presets[0]!.id));
    expect(again.result.current.presets).toHaveLength(0);
  });

  it('ignora nome vazio', () => {
    const { result } = renderHook(() => useReportPresets('t2'));
    act(() => result.current.savePreset('   ', ['a'], DEFAULT_REPORT_OPTIONS, {}));
    expect(result.current.presets).toHaveLength(0);
  });
});
