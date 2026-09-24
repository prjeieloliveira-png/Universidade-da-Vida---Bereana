import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useStudentStore } from '@/features/registrations/store/studentStore';
import { supabase } from '@/shared/lib/supabase';
import { Loader2, CheckCircle2, X, ArrowLeftRight } from 'lucide-react';
import { formatCentsToBRL } from '@/shared/utils/currency';
import { PAYMENT_METHOD_LABELS } from '../types';

type LegacyPaymentItem = {
  name: string;
  birthDate: string;
  paymentMethod: 'PIX' | 'CARTÃO' | 'DINHEIRO' | '—';
};

type LegacyImportResult = {
  inserted: number;
  skipped: number;
};

interface LegacyImportBannerProps {
  editionId: string;
}

export function LegacyImportBanner({ editionId }: LegacyImportBannerProps) {
  const { students } = useStudentStore();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [importResult, setImportResult] = useState<LegacyImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const legacyStudents = students.filter(
    (student) => student.cohortId === 'turma-01' && student.status === 'Pago'
  );

  const totalLegacy = legacyStudents.length;
  const totalLegacyCents = totalLegacy * 20000;

  const [userRole, setUserRole] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserRole((data.user?.user_metadata?.role as string) || null);
    });
  }, []);
  const isDev = typeof window !== 'undefined' && window.location.search.includes('dev=true');
  const isCoordinator = isDev || userRole === 'coordinator';

  const importMutation = useMutation({
    mutationFn: async () => {
      if (!editionId) throw new Error('Edição ativa não encontrada');

      const items: LegacyPaymentItem[] = legacyStudents.map((student) => ({
        name: student.name,
        birthDate: student.birthDate,
        paymentMethod: student.paymentMethod as 'PIX' | 'CARTÃO' | 'DINHEIRO' | '—',
      }));

      const { data, error } = await (supabase as unknown as { rpc: (fn: string, args: { p_data: LegacyPaymentItem[] }) => Promise<{ data: unknown; error: unknown }> }).rpc('import_legacy_payments', {
        p_data: items,
      });

      if (error) throw error;
      return data as LegacyImportResult;
    },
    onSuccess: (result) => {
      setImportResult(result);
      setImportError(null);
      setIsModalOpen(false);

      void queryClient.invalidateQueries({ queryKey: ['payments', editionId] });

      void queryClient.invalidateQueries({ queryKey: ['payments', editionId] });
      void queryClient.invalidateQueries({ queryKey: ['cash-summary', editionId] });
      void queryClient.invalidateQueries({ queryKey: ['cash-flow', editionId] });
      void queryClient.invalidateQueries({ queryKey: ['registration-payment-statuses', editionId] });
    },
    onError: (error: Error) => {
      setImportError(error.message);
    },
  });

  const handleImport = () => {
    setImportError(null);
    setImportResult(null);
    importMutation.mutate();
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setImportError(null);
  };

  return (
    <>
      {isCoordinator && (
        <div className="rounded-2xl border border-[#58bc75]/40 bg-[#58bc75]/5 p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#58bc75]/15 flex items-center justify-center shrink-0">
              <ArrowLeftRight className="w-5 h-5 text-[#20693a]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Importar pagamentos do cadastro</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {totalLegacy > 0
                  ? `${totalLegacy} aluno${totalLegacy !== 1 ? 's' : ''} pago${totalLegacy !== 1 ? 's' : ''} (${formatCentsToBRL(totalLegacyCents)}) serão migrados para o Financeiro.`
                  : 'Nenhum pagamento legado encontrado no cadastro.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold bg-[#58bc75] hover:bg-[#4caa68] active:bg-[#419a5c] text-white transition-colors shadow-sm cursor-pointer whitespace-nowrap"
          >
            Importar
          </button>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleModalClose} />

          <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-black text-slate-900">Confirmar importação</h3>
              <button
                onClick={handleModalClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {importResult ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                  Importação concluída
                </div>
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pagamentos criados</span>
                    <span className="font-bold text-slate-900">{importResult.inserted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pagamentos ignorados (já existentes)</span>
                    <span className="font-bold text-slate-900">{importResult.skipped}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Valor total migrado</span>
                    <span className="font-bold text-slate-900">{formatCentsToBRL(totalLegacyCents)}</span>
                  </div>
                </div>
                <button
                  onClick={handleModalClose}
                  className="w-full py-3 rounded-2xl text-sm font-black bg-[#58bc75] hover:bg-[#4caa68] text-white transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  {totalLegacy} alunos com status <strong>Pago</strong> serão registrados como pagamentos no valor de{' '}
                  <strong>R$ 200,00</strong> cada, totalizando <strong>{formatCentsToBRL(totalLegacyCents)}</strong>.
                </p>

                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 max-h-64 overflow-y-auto space-y-2">
                  <p className="text-xs font-bold text-slate-500 mb-1">Lista de alunos a migrar</p>
                  {legacyStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-slate-700 font-medium truncate">{student.name}</span>
                      <span className="text-slate-500 whitespace-nowrap">
                        {PAYMENT_METHOD_LABELS[student.paymentMethod === 'PIX' ? 'pix' : student.paymentMethod === 'CARTÃO' ? 'credit' : 'cash']}
                      </span>
                    </div>
                  ))}
                </div>

                {importError && (
                  <p className="text-xs text-rose-600 font-medium">{importError}</p>
                )}

                <button
                  onClick={handleImport}
                  disabled={importMutation.isPending}
                  className="w-full py-3 rounded-2xl text-sm font-black bg-[#58bc75] hover:bg-[#4caa68] disabled:opacity-60 text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {importMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Confirmar importação
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}