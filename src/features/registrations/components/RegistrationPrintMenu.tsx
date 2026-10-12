import { useState, useRef, useEffect } from 'react';
import { Printer, ChevronDown, FileText, ListChecks } from 'lucide-react';

interface RegistrationPrintMenuProps {
  onPrintAllDetailed: () => void;
  onPrintAllSummary: () => void;
}

export function RegistrationPrintMenu({
  onPrintAllDetailed,
  onPrintAllSummary,
}: RegistrationPrintMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
          isOpen
            ? 'bg-[#163242] text-white border-[#163242]'
            : 'bg-[#163242]/10 hover:bg-[#163242]/20 text-[#163242] border-[#163242]/20'
        }`}
        title="Imprimir fichas dos alunos filtrados"
      >
        <Printer className={`w-3.5 h-3.5 ${isOpen ? 'text-[#58bc75]' : 'text-[#163242]'}`} />
        <span className="hidden sm:inline">Imprimir Fichas</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-20 w-64 bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          <button
            onClick={() => {
              setIsOpen(false);
              onPrintAllDetailed();
            }}
            className="w-full flex items-start gap-2.5 px-3.5 py-3 hover:bg-slate-50 transition-colors cursor-pointer text-left border-b border-slate-100"
          >
            <FileText className="w-4 h-4 text-[#163242] shrink-0 mt-0.5" />
            <span>
              <span className="block text-xs font-bold text-slate-800">Ficha Completa</span>
              <span className="block text-[11px] text-slate-400 mt-0.5">Uma página por aluno, com todos os dados</span>
            </span>
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              onPrintAllSummary();
            }}
            className="w-full flex items-start gap-2.5 px-3.5 py-3 hover:bg-slate-50 transition-colors cursor-pointer text-left"
          >
            <ListChecks className="w-4 h-4 text-[#163242] shrink-0 mt-0.5" />
            <span>
              <span className="block text-xs font-bold text-slate-800">Lista Resumida</span>
              <span className="block text-[11px] text-slate-400 mt-0.5">Nome, G12, líder, pagamento e frequência</span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
