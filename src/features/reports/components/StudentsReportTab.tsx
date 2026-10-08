import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Printer, Download } from 'lucide-react';
import { useStudentStore } from '@/features/registrations/store/studentStore';
import { useCohortStore } from '@/features/cohorts/store/cohortStore';
import { useActiveEdition } from '@/shared/hooks/useActiveEdition';
import { useUserRole } from '@/shared/hooks/useUserRole';
import { filterStudents } from '@/features/registrations/utils/studentFilter';
import {
  initialRegistrationFilterState,
  type RegistrationFilterState,
} from '@/features/registrations/types';
import { fetchRegistrationPaymentStatuses } from '@/features/financial/data/financialData';
import { useReportConfig } from '../hooks/useReportConfig';
import { useReportPresets } from '../hooks/useReportPresets';
import {
  STUDENT_GROUP_OPTIONS,
  STUDENT_REPORT_COLUMNS,
  STUDENT_SORT_OPTIONS,
  groupStudentRows,
  sortStudentRows,
  toStudentReportRows,
} from '../utils/studentReport';
import { buildCsv, downloadCsv } from '../utils/csv';
import { ReportColumnPicker } from './ReportColumnPicker';
import { ReportOptionsPanel } from './ReportOptionsPanel';
import { ReportPresetsBar } from './ReportPresetsBar';
import { ReportSection } from './ReportSection';
import { ReportSheet } from './ReportSheet';
import { ReportPreview } from './ReportPreview';
import { ReportPrintPortal } from './ReportPrintPortal';
import { StudentFiltersPanel, describeStudentFilters } from './StudentFiltersPanel';

export function StudentsReportTab() {
  const { students } = useStudentStore();
  const { activeCohortId, getActiveCohort } = useCohortStore();
  const cohort = getActiveCohort();
  const { data: edition } = useActiveEdition();
  const { isCoordOrSec, fullName } = useUserRole();

  const { data: statuses } = useQuery({
    queryKey: ['reg-payment-statuses', edition?.id ?? ''],
    queryFn: () => fetchRegistrationPaymentStatuses(edition!.id),
    enabled: !!edition?.id,
    staleTime: 30_000,
  });

  const availableColumns = useMemo(
    () => STUDENT_REPORT_COLUMNS.filter((c) => !c.restricted || isCoordOrSec),
    [isCoordOrSec]
  );
  const config = useReportConfig(availableColumns, { title: 'Relação de alunos' });
  const { presets, savePreset, deletePreset } = useReportPresets<RegistrationFilterState>('students');

  const [filters, setFilters] = useState<RegistrationFilterState>(initialRegistrationFilterState);
  const handleFilterChange = useCallback(
    <K extends keyof RegistrationFilterState>(key: K, value: RegistrationFilterState[K]) =>
      setFilters((prev) => ({ ...prev, [key]: value })),
    []
  );
  const resetFilters = useCallback(() => setFilters(initialRegistrationFilterState), []);

  const cohortStudents = useMemo(
    () => students.filter((s) => (s.cohortId || 'turma-01') === activeCohortId),
    [students, activeCohortId]
  );
  const allRows = useMemo(() => toStudentReportRows(cohortStudents, statuses), [cohortStudents, statuses]);

  const groups = useMemo(() => {
    const filtered = filterStudents(allRows, filters);
    return groupStudentRows(sortStudentRows(filtered, config.options.sortBy), config.options.groupBy);
  }, [allRows, filters, config.options.sortBy, config.options.groupBy]);

  const total = groups.reduce((acc, g) => acc + g.rows.length, 0);
  const sheetProps = {
    title: config.options.title || 'Relação de alunos',
    subtitle: config.options.subtitle || cohort.name,
    filtersSummary: describeStudentFilters(filters),
    issuedBy: fullName,
    issuedAt: new Date(),
    columns: config.visibleColumns,
    groups,
    options: config.options,
    totalLabel: `${total} ${total === 1 ? 'aluno' : 'alunos'} (de ${allRows.length})`,
  };

  const canOutput = config.visibleColumns.length > 0;

  const handleCsv = () =>
    downloadCsv(
      `relatorio_alunos_${new Date().toISOString().slice(0, 10)}.csv`,
      buildCsv(config.visibleColumns, groups, { groupLabel: 'Grupo', showRowNumbers: config.options.showRowNumbers })
    );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[22rem_1fr] gap-4 items-start">
      <div className="space-y-3">
        <ReportSection title="Filtros" badge={`${total} de ${allRows.length}`} defaultOpen>
          <StudentFiltersPanel
            students={cohortStudents}
            filters={filters}
            onChange={handleFilterChange}
            onReset={resetFilters}
          />
        </ReportSection>
        <ReportSection title="Colunas" badge={`${config.visibleColumns.length}`}>
          <ReportColumnPicker
            columns={availableColumns}
            selectedIds={config.columnIds}
            onToggle={config.toggleColumn}
            onMove={config.moveColumn}
          />
        </ReportSection>
        <ReportSection title="Página e organização">
          <ReportOptionsPanel
            options={config.options}
            onChange={config.updateOptions}
            sortOptions={STUDENT_SORT_OPTIONS}
            groupOptions={STUDENT_GROUP_OPTIONS}
          />
        </ReportSection>
        <ReportSection title="Modelos">
          <ReportPresetsBar
            presets={presets}
            onApply={(p) => {
              config.applyConfig(p.columnIds, p.options);
              setFilters({ ...initialRegistrationFilterState, ...p.filters });
            }}
            onSave={(name) => savePreset(name, config.columnIds, config.options, filters)}
            onDelete={deletePreset}
          />
        </ReportSection>
      </div>

      <div className="space-y-3 min-w-0">
        <div className="flex items-center justify-end gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleCsv}
            disabled={!canOutput}
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-full text-xs font-bold bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 disabled:opacity-40 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            disabled={!canOutput}
            className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-full text-xs font-bold bg-[#163242] hover:bg-[#1f4358] text-white shadow-xs disabled:opacity-40 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#58bc75]" />
            Imprimir (A4)
          </button>
        </div>

        <ReportPreview orientation={config.options.orientation}>
          <ReportSheet {...sheetProps} />
        </ReportPreview>
      </div>

      <ReportPrintPortal orientation={config.options.orientation}>
        <ReportSheet {...sheetProps} />
      </ReportPrintPortal>
    </div>
  );
}
