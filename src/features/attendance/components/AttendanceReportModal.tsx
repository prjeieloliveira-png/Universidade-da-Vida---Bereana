import { Printer, Download, X, Check, FileSpreadsheet, Users, Calendar } from 'lucide-react';
import type { StudentRecord } from '@/features/registrations/types';
import { useLessonStore } from '../store/lessonStore';

interface AttendanceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentRecord[];
  activeFiltersDesc?: string;
}

export function AttendanceReportModal({
  isOpen,
  onClose,
  students,
  activeFiltersDesc,
}: AttendanceReportModalProps) {
  const { lessons } = useLessonStore();
  if (!isOpen) return null;

  const total = students.length;
  const numWeeks = lessons.length;
  const weekCounts = lessons.map((l) => students.filter((s) => Boolean(s[l.key])).length);
  const totalPresences = weekCounts.reduce((acc, c) => acc + c, 0);
  const avgAttendance = total > 0 ? Math.round((totalPresences / (total * numWeeks)) * 100) : 0;
  const perfectStudents = students.filter((s) => lessons.every((l) => Boolean(s[l.key]))).length;

  const handleExportCSV = () => {
    const headers = [
      'Nº', 'Nome', 'Telefone', 'Pastor', 'G12', 'Líder',
      ...lessons.map((l) => `S${l.number} (${l.theme})`),
      'Total Presenças', 'Frequência (%)',
    ];
    const rows = students.map((s) => {
      const presCount = lessons.filter((l) => Boolean(s[l.key])).length;
      const pct = Math.round((presCount / numWeeks) * 100);
      return [
        s.num,
        `"${s.name.replace(/"/g, '""')}"`,
        `"${s.phone}"`,
        `"${s.pastor}"`,
        `"${s.g12}"`,
        `"${s.leader}"`,
        ...lessons.map((l) => (s[l.key] ? 'PRESENTE' : 'FALTA')),
        `${presCount}/${numWeeks}`,
        `${pct}%`,
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_chamada_uv2026_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:static print:bg-white animate-in fade-in duration-150">
      <div className="bg-white rounded-[28px] shadow-2xl border border-slate-200/80 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden print:max-h-none print:shadow-none print:border-none print:rounded-none my-auto">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50/80 print:hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#163242] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              <FileSpreadsheet className="w-5 h-5 text-[#58bc75]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
                Relatório de Frequência e Chamadas
              </h3>
              <p className="text-xs text-slate-500 truncate">
                Universidade da Vida 2026 • {numWeeks} Semanas de Encontros
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportCSV}
              className="px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#163242] hover:bg-[#1f4358] text-white flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#58bc75]" />
              <span>Imprimir</span>
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
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 print:p-2 print:overflow-visible text-slate-800">
          {/* Document Header */}
          <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#20693a] bg-[#e8f8ee] px-2.5 py-0.5 rounded-full">
                Igreja Bereana • Relatório Oficial
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
                Universidade da Vida 2026 — Frequência Geral
              </h1>
              <p className="text-xs text-slate-500">
                {total} alunos listados {activeFiltersDesc ? `• Filtro: ${activeFiltersDesc}` : ''}
              </p>
            </div>
            <div className="text-left sm:text-right text-xs text-slate-400">
              <p className="flex items-center sm:justify-end gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Emissão: {currentDate}</span>
              </p>
              <p className="text-[11px]">Sistema de Gestão Bereana</p>
            </div>
          </div>

          {/* 9 Weeks Overview Mini Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
              <p className="text-lg font-black text-slate-900">{total}</p>
            </div>
            {lessons.map((w, idx) => {
              const count = weekCounts[idx] ?? 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={w.number} className="bg-slate-50 border border-slate-200/80 rounded-xl p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">S{w.number}</span>
                    <span className="text-[9px] font-black text-[#2e844b]">{pct}%</span>
                  </div>
                  <p className="text-sm font-black text-slate-800">{count}/{total}</p>
                </div>
              );
            })}
          </div>

          {/* Summary Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-[#e8f8ee] border border-[#c4e3d0] rounded-xl text-xs font-semibold text-[#1a5b32] gap-1.5">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#2e844b]" />
              <span>Taxa Geral de Frequência: <strong>{avgAttendance}%</strong></span>
            </div>
            <span>Alunos 100% Presentes: <strong>{perfectStudents}</strong> ({total > 0 ? Math.round((perfectStudents / total) * 100) : 0}%)</span>
          </div>

          {/* Detailed Table (Horizontal Scrollable on Mobile) */}
          <div className="border border-slate-200 rounded-2xl overflow-x-auto shadow-2xs">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-100/90 text-slate-600 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3 w-10 text-center">Nº</th>
                  <th className="py-2.5 px-3 min-w-[150px]">Nome do Aluno</th>
                  <th className="py-2.5 px-3 hidden md:table-cell">Pastor / Rede</th>
                  {lessons.map((l) => (
                    <th key={l.number} className="py-2.5 px-1.5 text-center w-10" title={`S${l.number}: ${l.theme}`}>
                      S{l.number}
                    </th>
                  ))}
                  <th className="py-2.5 px-3 text-center w-16">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70">
                {students.map((student) => {
                  const presCount = lessons.filter((l) => Boolean(student[l.key])).length;
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2 px-3 text-center font-bold text-slate-500">{student.num}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">
                        <div className="truncate max-w-[180px] sm:max-w-none">{student.name}</div>
                        <div className="text-[10px] text-slate-400 md:hidden">{student.pastor} • {student.g12}</div>
                      </td>
                      <td className="py-2 px-3 text-slate-600 hidden md:table-cell truncate max-w-[130px]">{student.pastor}</td>
                      {lessons.map((l) => {
                        const isPresent = Boolean(student[l.key]);
                        return (
                          <td key={l.number} className="py-2 px-1 text-center">
                            <span
                              className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black ${
                                isPresent ? 'bg-[#58bc75] text-white' : 'bg-rose-100 text-rose-700'
                              }`}
                            >
                              {isPresent ? <Check className="w-3 h-3 stroke-[3]" /> : 'F'}
                            </span>
                          </td>
                        );
                      })}
                      <td className="py-2 px-2 text-center font-bold">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] ${
                            presCount === numWeeks
                              ? 'bg-[#e8f8ee] text-[#1a5b32]'
                              : presCount >= Math.floor(numWeeks / 2)
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {presCount}/{numWeeks}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="text-center text-[10px] text-slate-400 pt-1 border-t border-slate-100">
            Relatório gerado automaticamente pelo Sistema Universidade da Vida Bereana • P: Presente | F: Falta
          </div>
        </div>
      </div>
    </div>
  );
}

