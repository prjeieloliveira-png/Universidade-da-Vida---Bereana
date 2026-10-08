import { useState } from 'react';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useUserRole } from '@/shared/hooks/useUserRole';
import { StudentsReportTab } from '../components/StudentsReportTab';

type TabId = 'alunos' | 'frequencia' | 'financeiro';

const TABS: { id: TabId; label: string; ready: boolean }[] = [
  { id: 'alunos', label: 'Alunos', ready: true },
  { id: 'frequencia', label: 'Frequência', ready: false },
  { id: 'financeiro', label: 'Financeiro', ready: false },
];

export function ReportsPage() {
  const { isCoordOrSec, isLoading } = useUserRole();
  const [tab, setTab] = useState<TabId>('alunos');

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-7 h-7 animate-spin text-[#58bc75]" />
      </div>
    );
  }

  if (!isCoordOrSec) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 text-center bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
        <ShieldAlert className="w-8 h-8 text-rose-500 mx-auto" />
        <h2 className="text-lg font-black text-slate-900">Acesso restrito</h2>
        <p className="text-xs text-slate-500">Os relatórios são restritos à Coordenação Geral e à Secretaria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
          <span>Portal</span>
          <span>&gt;</span>
          <span className="text-slate-600 font-semibold">Relatórios</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Relatórios</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Monte o relatório que precisar: escolha filtros e colunas e imprima em folha A4.
        </p>
      </div>

      <div role="tablist" className="flex gap-1.5 bg-slate-200/60 p-1 rounded-2xl max-w-md">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            disabled={!t.ready}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all ${
              tab === t.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            } ${t.ready ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
          >
            {t.label}
            {!t.ready && <span className="block text-[9px] font-semibold uppercase">em breve</span>}
          </button>
        ))}
      </div>

      {tab === 'alunos' && <StudentsReportTab />}
    </div>
  );
}
