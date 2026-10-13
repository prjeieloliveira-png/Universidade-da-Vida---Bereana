import { useCallback, useMemo, useState } from 'react';
import { Download, Loader2, Printer } from 'lucide-react';
import { useActiveEdition } from '@/shared/hooks/useActiveEdition';
import { useUserRole } from '@/shared/hooks/useUserRole';
import { useTeamRoles } from '@/features/teams/hooks/useTeamRoles';
import { useTeamMembers } from '@/features/teams/hooks/useTeamMembers';
import { useReportConfig } from '../hooks/useReportConfig';
import { useReportPresets } from '../hooks/useReportPresets';
import {
  TEAM_GROUP_OPTIONS,
  TEAM_REPORT_COLUMNS,
  TEAM_SORT_OPTIONS,
  filterTeamRows,
  groupTeamRows,
  initialTeamReportFilterState,
  sortTeamRows,
  toTeamReportRows,
  type TeamReportFilterState,
} from '../utils/teamReport';
import { buildCsv, downloadCsv } from '../utils/csv';
import { ReportColumnPicker } from './ReportColumnPicker';
import { ReportOptionsPanel } from './ReportOptionsPanel';
import { ReportPresetsBar } from './ReportPresetsBar';
import { ReportSection } from './ReportSection';
import { ReportSheet } from './ReportSheet';
import { ReportPreview } from './ReportPreview';
import { ReportPrintPortal } from './ReportPrintPortal';
import { TeamFiltersPanel, describeTeamFilters } from './TeamFiltersPanel';

export function TeamsReportTab() {
  const { data: edition, isLoading: isEditionLoading } = useActiveEdition();
  const { fullName } = useUserRole();
  const { roles, isLoading: isRolesLoading } = useTeamRoles();
  const { members, isLoading: isMembersLoading } = useTeamMembers(edition?.id);

  const config = useReportConfig(TEAM_REPORT_COLUMNS, {
    title: 'Relação de equipes de serviço',
    subtitle: edition?.name || 'Universidade da Vida',
    groupBy: 'role',
    sortBy: 'role_then_name',
  });

  const { presets, savePreset, deletePreset } =
    useReportPresets<TeamReportFilterState>('teams');

  const [filters, setFilters] = useState<TeamReportFilterState>(
    initialTeamReportFilterState
  );

  const handleFilterChange = useCallback(
    <K extends keyof TeamReportFilterState>(
      key: K,
      value: TeamReportFilterState[K]
    ) => setFilters((prev) => ({ ...prev, [key]: value })),
    []
  );

  const resetFilters = useCallback(
    () => setFilters(initialTeamReportFilterState),
    []
  );

  const allRows = useMemo(() => toTeamReportRows(members), [members]);

  const groups = useMemo(() => {
    const filtered = filterTeamRows(allRows, filters);
    const sorted = sortTeamRows(filtered, config.options.sortBy);
    return groupTeamRows(sorted, config.options.groupBy);
  }, [allRows, filters, config.options.sortBy, config.options.groupBy]);

  const total = groups.reduce((acc, g) => acc + g.rows.length, 0);

  const sheetProps = {
    title: config.options.title || 'Relação de equipes de serviço',
    subtitle: config.options.subtitle || edition?.name || '',
    filtersSummary: describeTeamFilters(filters, roles),
    issuedBy: fullName,
    issuedAt: new Date(),
    columns: config.visibleColumns,
    groups,
    options: config.options,
    totalLabel: `${total} ${total === 1 ? 'voluntário' : 'voluntários'} (de ${allRows.length})`,
  };

  const canOutput = config.visibleColumns.length > 0;

  const handleCsv = () =>
    downloadCsv(
      `relatorio_equipes_${new Date().toISOString().slice(0, 10)}.csv`,
      buildCsv(config.visibleColumns, groups, {
        groupLabel: 'Equipe',
        showRowNumbers: config.options.showRowNumbers,
      })
    );

  if (isEditionLoading || isRolesLoading || isMembersLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-[#58bc75]" />
        <span className="text-xs font-semibold">Carregando dados das equipes...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[22rem_1fr] gap-4 items-start">
      <div className="space-y-3">
        <ReportSection
          title="Filtros"
          badge={`${total} de ${allRows.length}`}
          defaultOpen
        >
          <TeamFiltersPanel
            roles={roles}
            filters={filters}
            onChange={handleFilterChange}
            onReset={resetFilters}
          />
        </ReportSection>

        <ReportSection
          title="Colunas"
          badge={`${config.visibleColumns.length}`}
        >
          <ReportColumnPicker
            columns={TEAM_REPORT_COLUMNS}
            selectedIds={config.columnIds}
            onToggle={config.toggleColumn}
            onMove={config.moveColumn}
          />
        </ReportSection>

        <ReportSection title="Página e organização">
          <ReportOptionsPanel
            options={config.options}
            onChange={config.updateOptions}
            sortOptions={TEAM_SORT_OPTIONS}
            groupOptions={TEAM_GROUP_OPTIONS}
          />
        </ReportSection>

        <ReportSection title="Modelos">
          <ReportPresetsBar
            presets={presets}
            onApply={(p) => {
              config.applyConfig(p.columnIds, p.options);
              setFilters({ ...initialTeamReportFilterState, ...p.filters });
            }}
            onSave={(name) =>
              savePreset(name, config.columnIds, config.options, filters)
            }
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
