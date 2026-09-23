import { useEffect, useRef } from 'react';
import { X, Printer } from 'lucide-react';
import { StudentRecord } from '../types';
import { StudentPrintSheet } from './StudentPrintSheet';

interface StudentIndividualPrintModalProps {
  student: StudentRecord | null;
  cohortName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function StudentIndividualPrintModal({
  student,
  cohortName,
  isOpen,
  onClose,
}: StudentIndividualPrintModalProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !student) return null;

  const handlePrint = () => {
    const printContent = printAreaRef.current?.innerHTML;
    if (!printContent) return;

    const win = window.open('', '_blank', 'width=794,height=1123');
    if (!win) return;

    win.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Ficha — ${student.name}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet" />
        <style>
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          html, body { width: 210mm; min-height: 297mm; background: white; font-family: Inter, system-ui, sans-serif; }
          body { padding: 16mm 14mm; }
          @media print {
            html, body { width: 210mm; height: 297mm; margin: 0; padding: 14mm; }
            @page { size: A4 portrait; margin: 0; }
          }
          .space-y-1\\.5 > * + * { margin-top: 6px; }
          .grid { display: grid; }
          .grid-cols-2 { grid-template-columns: 1fr 1fr; }
          .grid-cols-3 { grid-template-columns: 1fr 1fr 1fr; }
          .gap-2 { gap: 8px; }
          .gap-3 { gap: 12px; }
          .flex { display: flex; }
          .flex-col { flex-direction: column; }
          .flex-wrap { flex-wrap: wrap; }
          .items-center { align-items: center; }
          .items-end { align-items: flex-end; }
          .justify-between { justify-content: space-between; }
          .gap-0\\.5 { gap: 2px; }
          .shrink-0 { flex-shrink: 0; }
          .flex-1 { flex: 1 1 0%; }
          .min-w-0 { min-width: 0; }
          .truncate { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .uppercase { text-transform: uppercase; }
          .rounded-xl { border-radius: 12px; }
          .rounded-lg { border-radius: 8px; }
          .rounded-full { border-radius: 9999px; }
          .p-3 { padding: 12px; }
          .px-3 { padding-left: 12px; padding-right: 12px; }
          .py-1 { padding-top: 4px; padding-bottom: 4px; }
          .pb-3 { padding-bottom: 12px; }
          .pt-3 { padding-top: 12px; }
          .mb-0\\.5 { margin-bottom: 2px; }
          .mb-2 { margin-bottom: 8px; }
          .mb-3 { margin-bottom: 12px; }
          .mb-4 { margin-bottom: 16px; }
          .mt-3 { margin-top: 12px; }
          .w-full { width: 100%; }
          .bg-white { background: #ffffff; }
          .font-black { font-weight: 900; }
          .font-bold { font-weight: 700; }
          .font-semibold { font-weight: 600; }
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
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative bg-white rounded-[28px] shadow-2xl w-full max-w-2xl max-h-[94vh] flex flex-col overflow-hidden border border-slate-200">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/60 shrink-0">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Pré-visualização da Ficha
            </p>
            <h3 className="text-base font-black text-slate-900 leading-tight">{student.name}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="btn-print-individual"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-[#163242] hover:bg-[#1f4358] text-white transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#58bc75]" />
              Imprimir / PDF
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Print Preview */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-6">
          {/* A4 page simulation */}
          <div
            ref={printAreaRef}
            className="bg-white mx-auto shadow-md"
            style={{ width: '100%', maxWidth: 595, padding: '32px 28px', borderRadius: 8 }}
          >
            <StudentPrintSheet student={student} cohortName={cohortName} />
          </div>
        </div>
      </div>
    </div>
  );
}
