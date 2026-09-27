import { useRef } from 'react';
import { X, Printer, ListChecks } from 'lucide-react';
import { StudentRecord } from '../types';
import { StudentSummaryPrintSheet } from './StudentSummaryPrintSheet';

interface StudentSummaryPrintModalProps {
  students: StudentRecord[];
  cohortName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function StudentSummaryPrintModal({
  students,
  cohortName,
  isOpen,
  onClose,
}: StudentSummaryPrintModalProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    const printContent = printAreaRef.current?.innerHTML;
    if (!printContent) return;

    const win = window.open('', '_blank', 'width=900,height=1000');
    if (!win) return;

    win.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Lista Resumida — ${cohortName}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet" />
        <style>
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          html, body { width: 210mm; background: white; font-family: Inter, system-ui, sans-serif; }
          body { padding: 14mm; }
          @media print {
            html, body { width: 210mm; margin: 0; }
            @page { size: A4 portrait; margin: 14mm; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>${printContent}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative bg-white rounded-[28px] shadow-2xl w-full max-w-3xl max-h-[94vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#163242] flex items-center justify-center shrink-0">
              <ListChecks className="w-4 h-4 text-[#58bc75]" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Lista Resumida
              </p>
              <h3 className="text-sm font-black text-slate-900 leading-tight">
                {students.length} aluno{students.length !== 1 ? 's' : ''} — {cohortName}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="btn-print-summary"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-[#163242] hover:bg-[#1f4358] text-white transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#58bc75]" />
              <span>Imprimir Lista</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-100 shrink-0">
          <p className="text-[11px] text-amber-800 font-semibold">
            📄 Uma linha por aluno (nome, G12, líder, pagamento e frequência) — quantas couberem por página A4.
          </p>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-5">
          <div
            ref={printAreaRef}
            className="bg-white mx-auto shadow-md"
            style={{ width: '100%', maxWidth: 760, padding: '24px 20px', borderRadius: 8 }}
          >
            <StudentSummaryPrintSheet students={students} cohortName={cohortName} />
          </div>
        </div>
      </div>
    </div>
  );
}
