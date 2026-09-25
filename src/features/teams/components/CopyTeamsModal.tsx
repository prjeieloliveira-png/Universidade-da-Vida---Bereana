import React, { useState, useEffect } from 'react';
import { X, Copy, Loader2, CheckCircle2, AlertCircle, Users } from 'lucide-react';
import { useCopyTeams, type PreviewMember } from '../hooks/useCopyTeams';
import type { Database } from '@/shared/types/database';

type EditionRow = Database['public']['Tables']['editions']['Row'];

interface CopyTeamsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEdition: EditionRow;
}

export const CopyTeamsModal: React.FC<CopyTeamsModalProps> = ({
  isOpen,
  onClose,
  currentEdition,
}) => {
  const { editions, isEditionsLoading, fetchSourcePreview, copyTeams, isCopying } = useCopyTeams(
    currentEdition.id
  );

  const [sourceEditionId, setSourceEditionId] = useState('');
  const [previewMembers, setPreviewMembers] = useState<PreviewMember[]>([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [resultMsg, setResultMsg] = useState<{ copied: number; skipped: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const availableEditions = editions.filter((e) => e.id !== currentEdition.id);

  useEffect(() => {
    if (availableEditions.length > 0 && !sourceEditionId) {
      setSourceEditionId(availableEditions[0]?.id || '');
    }
    setResultMsg(null);
    setErrorMsg(null);
  }, [availableEditions, isOpen]);

  // Carregar prévia sempre que a turma de origem mudar
  useEffect(() => {
    if (!sourceEditionId) {
      setPreviewMembers([]);
      return;
    }

    let isMounted = true;
    setIsLoadingPreview(true);
    setErrorMsg(null);

    fetchSourcePreview(sourceEditionId)
      .then((data) => {
        if (isMounted) setPreviewMembers(data);
      })
      .catch((err) => {
        if (isMounted) setErrorMsg('Erro ao carregar prévia: ' + (err as Error).message);
      })
      .finally(() => {
        if (isMounted) setIsLoadingPreview(false);
      });

    return () => {
      isMounted = false;
    };
  }, [sourceEditionId]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!sourceEditionId) return;
    setErrorMsg(null);
    try {
      const res = await copyTeams({ sourceEditionId });
      setResultMsg(res);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao copiar equipes');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-[32px] border border-slate-200/90 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
              <Copy className="w-4 h-4 text-[#58bc75]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Copiar Equipes de Outra Turma
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Destino: <strong>{currentEdition.name}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {resultMsg ? (
            <div className="space-y-4 text-center py-6">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-black text-base text-slate-900">Equipes Copiadas com Sucesso!</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Foram copiados <strong>{resultMsg.copied} novos membros</strong> para a turma atual.
                {resultMsg.skipped > 0 && (
                  <span> ({resultMsg.skipped} membros já existiam e foram ignorados).</span>
                )}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-full text-xs font-bold bg-[#58bc75] hover:bg-[#4caa68] text-white transition-colors cursor-pointer"
                >
                  Concluir
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Seletor de turma de origem */}
              <div>
                <label
                  className="block text-xs font-bold text-slate-700 mb-1"
                  htmlFor="source-edition"
                >
                  Turma de Origem *
                </label>
                {isEditionsLoading ? (
                  <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#58bc75]" />
                    Carregando turmas...
                  </div>
                ) : availableEditions.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2">
                    Nenhuma outra turma encontrada para copiar.
                  </p>
                ) : (
                  <select
                    id="source-edition"
                    value={sourceEditionId}
                    onChange={(e) => setSourceEditionId(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#58bc75] focus:bg-white transition-all font-medium"
                  >
                    {availableEditions.map((ed) => (
                      <option key={ed.id} value={ed.id}>
                        {ed.name} ({ed.year})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Prévia dos membros */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">Prévia da Formação</span>
                  <span className="text-[11px] font-bold text-slate-400">
                    {previewMembers.length} membros ativos
                  </span>
                </div>

                {isLoadingPreview ? (
                  <div className="p-8 text-center border border-slate-200 rounded-2xl bg-slate-50 flex items-center justify-center gap-2 text-xs text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin text-[#58bc75]" />
                    Carregando voluntários da turma de origem...
                  </div>
                ) : previewMembers.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <Users className="w-5 h-5 text-slate-300 mx-auto mb-1" />
                    <p className="text-xs text-slate-400">
                      Nenhum membro ativo cadastrado na turma de origem selecionada.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-2xl divide-y divide-slate-100 bg-slate-50/40">
                    {previewMembers.map((m) => (
                      <div key={m.id} className="p-2.5 flex items-center justify-between text-xs">
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-slate-900 truncate">{m.personName}</p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {m.personPhone || 'Sem telefone'}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-white border border-slate-200 text-slate-700 shrink-0">
                          {m.teamRoleName}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-800">
                <strong>Atenção:</strong> Apenas os cadastros dos voluntários ativos serão copiados.
                O histórico de presenças em reuniões não é transferido.
              </div>

              {/* Footer Actions */}
              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isCopying}
                  className="px-5 py-2.5 min-h-[44px] rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isCopying || previewMembers.length === 0}
                  className="px-6 py-2.5 min-h-[44px] rounded-full text-xs font-bold bg-slate-900 hover:bg-slate-800 active:bg-slate-950 disabled:opacity-50 text-white transition-colors shadow-xs cursor-pointer inline-flex items-center gap-2"
                >
                  {isCopying && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Copiar {previewMembers.length} Membros</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
