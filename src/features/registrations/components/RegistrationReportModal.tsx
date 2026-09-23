import { useMemo } from 'react';
import { StudentRecord, RegistrationFilterState } from '../types';
import { Printer, Download, X, FileText, CheckCircle2, Clock } from 'lucide-react';
import { formatCentsToBRL } from '@/shared/utils/currency';

interface RegistrationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentRecord[];
  cohortName: string;
  filters: RegistrationFilterState;
}

export function RegistrationReportModal({
  isOpen,
  onClose,
  students,
  cohortName,
  filters,
}: RegistrationReportModalProps) {
  const paidCount = useMemo(() => students.filter((s) => s.status === 'Pago').length, [students]);
  const pendingCount = students.length - paidCount;
  const totalAmountCents = useMemo(
    () => students.filter((s) => s.status === 'Pago').reduce((acc, s) => acc + (s.amountCents || 0), 0),
    [students]
  );

  const activeFilterTags = useMemo(() => {
    const tags: string[] = [];
    if (filters.status !== 'ALL') tags.push(`Status: ${filters.status}`);
    if (filters.paymentMethod !== 'ALL') tags.push(`Pagamento: ${filters.paymentMethod}`);
    if (filters.gender !== 'ALL') tags.push(`Sexo: ${filters.gender}`);
    if (filters.ageRange !== 'ALL') {
      const label =
        filters.ageRange === 'under18' ? '< 18 anos' :
        filters.ageRange === '18-29' ? '18 a 29 anos' :
        filters.ageRange === '30-49' ? '30 a 49 anos' : '50+ anos';
      tags.push(`Idade: ${label}`);
    }
    if (filters.maritalStatus !== 'ALL') tags.push(`Est. Civil: ${filters.maritalStatus}`);
    if (filters.shirtSize !== 'ALL') tags.push(`Camiseta: ${filters.shirtSize}`);
    if (filters.comorbidity !== 'ALL') tags.push(`Comorbidade: ${filters.comorbidity === 'SIM' ? 'Sim' : 'Não'}`);
    if (filters.pastor !== 'ALL') tags.push(`Pastor: ${filters.pastor}`);
    if (filters.g12 !== 'ALL') tags.push(`G12: ${filters.g12}`);
    if (filters.leader !== 'ALL') tags.push(`Líder: ${filters.leader}`);
    if (filters.searchQuery.trim()) tags.push(`Busca: "${filters.searchQuery}"`);
    return tags;
  }, [filters]);

  const handleExportCSV = () => {
    const headers = ['Nº', 'Nome', 'Sexo', 'Idade', 'Estado Civil', 'Telefone', 'Camiseta', 'Pastor', 'G12', 'Líder', 'Status', 'Forma Pagamento', 'Comorbidade'];
    const rows = students.map((s) => [
      s.num,
      `"${s.name}"`,
      s.gender,
      s.age,
      s.maritalStatus,
      `"${s.phone}"`,
      s.shirtSize,
      `"${s.pastor}"`,
      `"${s.g12}"`,
      `"${s.leader}"`,
      s.status,
      s.paymentMethod,
      s.comorbidity,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-alunos-${cohortName.toLowerCase().replace(/\s+/g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200/80 print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Header - Hidden on Print */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50 print:hidden shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#163242] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              <FileText className="w-5 h-5 text-[#58bc75]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Relatório de Inscrições
              </h3>
              <p className="text-xs text-slate-500">
                {cohortName} • {students.length} alunos filtrados
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#163242] hover:bg-[#1f4358] text-white flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#58bc75]" />
              <span>Imprimir / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 print:p-2 print:overflow-visible text-slate-800">
          {/* Printable Header */}
          <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#2e844b]">
                Universidade da Vida • Igreja Bereana
              </div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Relatório de Alunos Inscritos
              </h1>
              <div className="text-xs text-slate-500 mt-0.5">
                Turma: <strong>{cohortName}</strong> • Emitido em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {/* Quick Stat Chips */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                Total: <strong>{students.length}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-md bg-[#e8f8ee] text-[#1a5b32] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Pagos: <strong>{paidCount}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Pendentes: <strong>{pendingCount}</strong>
              </span>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFilterTags.length > 0 && (
            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/70 text-xs">
              <span className="font-bold text-slate-700 mr-1.5">Filtros Aplicados:</span>
              <span className="text-slate-600">{activeFilterTags.join(' • ')}</span>
            </div>
          )}

          {/* Report Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-300 bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-2 px-2 text-center w-8">Nº</th>
                  <th className="py-2 px-2">Nome do Aluno</th>
                  <th className="py-2 px-1 text-center w-10">Idade</th>
                  <th className="py-2 px-1 text-center w-12">Sexo</th>
                  <th className="py-2 px-2">Telefone</th>
                  <th className="py-2 px-2">Liderança (Pastor / Líder)</th>
                  <th className="py-2 px-1 text-center w-12">Camiseta</th>
                  <th className="py-2 px-2 text-center w-24">Pagamento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => (
                  <tr key={student.id || student.num} className="hover:bg-slate-50/60 print:hover:bg-transparent break-inside-avoid">
                    <td className="py-2 px-2 text-center font-bold text-slate-500">{student.num}</td>
                    <td className="py-2 px-2 font-semibold text-slate-900">
                      <div>{student.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{student.maritalStatus}</div>
                    </td>
                    <td className="py-2 px-1 text-center text-slate-700 font-medium">{student.age}a</td>
                    <td className="py-2 px-1 text-center text-slate-600">{student.gender.slice(0, 1)}</td>
                    <td className="py-2 px-2 text-slate-600 font-mono text-[11px]">{student.phone}</td>
                    <td className="py-2 px-2 text-[11px] text-slate-600">
                      <div className="truncate font-medium text-slate-800">{student.pastor}</div>
                      <div className="truncate text-slate-400 text-[10px]">{student.leader || student.g12 || '—'}</div>
                    </td>
                    <td className="py-2 px-1 text-center font-bold text-slate-700">{student.shirtSize || '—'}</td>
                    <td className="py-2 px-2 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        student.status === 'Pago' ? 'bg-[#e8f8ee] text-[#1a5b32]' : 'bg-amber-50 text-amber-800'
                      }`}>
                        {student.status}
                      </span>
                      {student.paymentMethod !== '—' && (
                        <div className="text-[9px] text-slate-400 mt-0.5">{student.paymentMethod}</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer on Print */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
            <span>Universidade da Vida Bereana • Relatório Oficial para Coordenação</span>
            <span>Total Arrecadado: {formatCentsToBRL(totalAmountCents)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
