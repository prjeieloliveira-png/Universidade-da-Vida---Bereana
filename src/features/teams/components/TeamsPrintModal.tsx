import React, { useState, useRef } from 'react';
import { X, Printer, Download, Eye, EyeOff, FileText } from 'lucide-react';
import { TeamsPrintSheet } from './TeamsPrintSheet';
import { unmaskPhone } from '@/shared/utils/phone';
import type { TeamRoleRow, TeamMemberWithDetails } from '../types/teams';

interface TeamsPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  roles: TeamRoleRow[];
  members: TeamMemberWithDetails[];
  editionName: string;
}

export const TeamsPrintModal: React.FC<TeamsPrintModalProps> = ({
  isOpen,
  onClose,
  roles,
  members,
  editionName,
}) => {
  const [includeInactive, setIncludeInactive] = useState(false);
  const printContainerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleExportCSV = () => {
    const sortedRoles = [...roles].sort((a, b) => a.sort_order - b.sort_order);
    const targetMembers = includeInactive ? members : members.filter((m) => m.active);

    const headers = [
      'Equipe',
      'Ordem da Equipe',
      'Nome do Voluntário',
      'Telefone',
      'Status',
      'Presenças',
      'Percentual',
      'Observações',
    ];

    const rows: string[] = [];

    sortedRoles.forEach((role) => {
      const roleMembers = targetMembers.filter((m) => m.teamRoleId === role.id);
      roleMembers.forEach((m) => {
        rows.push(
          [
            `"${role.name.replace(/"/g, '""')}"`,
            role.sort_order,
            `"${m.person.fullName.replace(/"/g, '""')}"`,
            `"${unmaskPhone(m.person.phone)}"`,
            m.active ? 'Ativo' : 'Inativo',
            `"${m.attendance.fraction}"`,
            `"${m.attendance.percentage}%"`,
            `"${(m.notes || '').replace(/"/g, '""')}"`,
          ].join(';')
        );
      });
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `equipes_uv_${editionName.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printContent = printContainerRef.current?.innerHTML;
    if (!printContent) {
      window.print();
      return;
    }

    const win = window.open('', '_blank', 'width=850,height=950');
    if (!win) {
      window.print();
      return;
    }

    win.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Relação de Equipes — ${editionName}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @page { size: A4 portrait; margin: 10mm; }
          *, *::before, *::after { box-sizing: border-box; }
          html, body { width: 100%; background: white; font-family: Inter, system-ui, sans-serif; }
          .break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
        </style>
      </head>
      <body class="p-2">
        ${printContent}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.focus();
              window.print();
              window.close();
            }, 300);
          };
        </script>
      </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs print:p-0 print:bg-white print:static animate-in fade-in duration-150">
      <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden border border-slate-200/90 print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Top Header - Hidden on Print */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/80 print:hidden shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#163242] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              <FileText className="w-5 h-5 text-[#58bc75]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Imprimir Relação de Equipes
              </h3>
              <p className="text-xs text-slate-500">
                {editionName} • Formato A4 pronto para impressão
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Toggle Inativos */}
            <button
              type="button"
              onClick={() => setIncludeInactive(!includeInactive)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] rounded-full text-xs font-bold transition-all border cursor-pointer ${
                includeInactive
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {includeInactive ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-[#58bc75]" />
                  <span>Ocultar Inativos</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>Incluir Inativos</span>
                </>
              )}
            </button>

            {/* Exportar CSV */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 min-h-[44px] rounded-full text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>

            {/* Imprimir */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 min-h-[44px] rounded-full text-xs font-bold bg-[#163242] hover:bg-[#1f4358] text-white shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#58bc75]" />
              <span>Imprimir / PDF</span>
            </button>

            {/* Fechar */}
            <button
              type="button"
              onClick={onClose}
              className="w-11 h-11 rounded-full bg-slate-200/70 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Fechar modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Sheet Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/60 print:bg-white print:p-0">
          <div ref={printContainerRef} className="shadow-lg print:shadow-none rounded-2xl bg-white">
            <TeamsPrintSheet
              roles={roles}
              members={members}
              editionName={editionName}
              includeInactive={includeInactive}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
