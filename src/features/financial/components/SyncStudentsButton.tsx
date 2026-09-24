import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useStudentStore } from '@/features/registrations/store/studentStore';
import { supabase } from '@/shared/lib/supabase';
import { Loader2, CheckCircle2, X, RefreshCw, AlertTriangle } from 'lucide-react';

interface SyncStudentsButtonProps {
  editionId: string;
}

interface SyncResult {
  synced: number;
  skipped: number;
}

export function SyncStudentsButton({ editionId }: SyncStudentsButtonProps) {
  const { students } = useStudentStore();
  const queryClient = useQueryClient();

  // Todos os hooks ANTES de qualquer return condicional
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const { data: dbCount, isLoading: countLoading } = useQuery<number>({
    queryKey: ['registrations-count', editionId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('registrations')
        .select('id', { count: 'exact', head: true })
        .eq('edition_id', editionId);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!editionId,
    staleTime: 10_000,
  });

  const cohortStudents = students.filter(
    (s) => !s.cohortId || s.cohortId === 'turma-01' || s.cohortId.startsWith('turma-')
  );
  const studentsToSync = cohortStudents.length > 0 ? cohortStudents : students;
  const localCount = studentsToSync.length;

  const syncMutation = useMutation({
    mutationFn: async () => {
      if (!editionId) throw new Error('Edição ativa não encontrada');

      const payload = studentsToSync.map((s) => ({
        full_name: s.name,
        birth_date: s.birthDate,
        gender: s.gender,
        marital_status: s.maritalStatus,
        phone: s.phone && s.phone !== '—' ? s.phone : '—',
        address: s.address && s.address !== '—' ? s.address : null,
        shirt_size: s.shirtSize && s.shirtSize !== '—' ? s.shirtSize : null,
        pastor: s.pastor ?? null,
        g12: s.g12 ?? null,
        leader: s.leader ?? null,
      }));

      type SyncRpcResult = { synced: number; skipped: number };
      const { data, error } = await (
        supabase as unknown as {
          rpc: (
            fn: string,
            args: { p_edition_id: string; p_data: typeof payload }
          ) => Promise<{ data: unknown; error: unknown }>;
        }
      ).rpc('sync_students_from_local', {
        p_edition_id: editionId,
        p_data: payload,
      });

      if (error) throw error as Error;
      return data as SyncRpcResult;
    },
    onSuccess: (result) => {
      setSyncResult(result);
      setSyncError(null);
      void queryClient.invalidateQueries({ queryKey: ['registrations-count', editionId] });
      void queryClient.invalidateQueries({ queryKey: ['reg-payment-statuses', editionId] });
      void queryClient.invalidateQueries({ queryKey: ['cash-summary', editionId] });
      void queryClient.invalidateQueries({ queryKey: ['people-for-payment', editionId] });
    },
    onError: (error: Error) => {
      setSyncError(error.message);
    },
  });

  const handleSync = () => {
    setSyncError(null);
    setSyncResult(null);
    syncMutation.mutate();
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSyncError(null);
    if (syncResult) setSyncResult(null);
  };

  const isSynced = !countLoading && typeof dbCount === 'number' && dbCount >= localCount;

  return (
    <>
      {/* Banner de alerta quando não sincronizado, ou barra compacta quando sincronizado */}
      {!isSynced ? (
        <div
          id="sync-students-banner"
          className="rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5 flex items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Alunos não sincronizados
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {countLoading
                  ? 'Verificando banco de dados...'
                  : `${localCount} aluno${localCount !== 1 ? 's' : ''} no cadastro local, ${dbCount ?? 0} no banco. Sincronize para habilitar lançamentos.`}
              </p>
            </div>
          </div>

          <button
            id="sync-students-btn"
            onClick={() => setIsModalOpen(true)}
            disabled={countLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white transition-colors shadow-sm cursor-pointer whitespace-nowrap disabled:opacity-50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sincronizar
          </button>
        </div>
      ) : (
        <div
          id="sync-students-synced-bar"
          className="flex items-center justify-between px-4 py-2.5 bg-emerald-50/60 border border-emerald-200/60 rounded-2xl text-xs text-emerald-800"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">
              Alunos sincronizados ({dbCount} cadastrados no banco)
            </span>
          </div>
          <button
            id="sync-again-btn"
            onClick={() => setIsModalOpen(true)}
            className="font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
          >
            <RefreshCw className="w-3 h-3" />
            Sincronizar novamente
          </button>
        </div>
      )}

      {/* Modal de confirmação */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

          <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-black text-slate-900">
                Sincronizar Alunos
              </h3>
              <button
                id="sync-modal-close"
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {syncResult ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                  Sincronização concluída!
                </div>
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Alunos sincronizados</span>
                    <span className="font-bold text-slate-900">{syncResult.synced}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Já existiam (ignorados)</span>
                    <span className="font-bold text-slate-900">{syncResult.skipped}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Agora use o banner <strong>"Importar Pagamentos"</strong> abaixo para
                  registrar os pagamentos dos alunos com status Pago.
                </p>
                <button
                  onClick={handleClose}
                  className="w-full py-3 rounded-2xl text-sm font-black bg-[#58bc75] hover:bg-[#4caa68] text-white transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  Isso irá criar <strong>{localCount} inscrições</strong> no banco de dados
                  (Supabase), copiando os dados do cadastro local. A operação é{' '}
                  <strong>idempotente</strong> — seguro rodar mais de uma vez.
                </p>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-800">
                  <strong>Atenção:</strong> Após sincronizar, use o banner
                  &quot;Importar pagamentos do cadastro&quot; para registrar os pagamentos dos
                  alunos que já pagaram.
                </div>

                {syncError && (
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-xs text-rose-700">
                    <strong>Erro:</strong> {syncError}
                  </div>
                )}

                <button
                  id="sync-confirm-btn"
                  onClick={handleSync}
                  disabled={syncMutation.isPending}
                  className="w-full py-3 rounded-2xl text-sm font-black bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {syncMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sincronizando {localCount} alunos...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Confirmar Sincronização
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
