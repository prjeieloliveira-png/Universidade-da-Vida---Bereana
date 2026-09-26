import { AlertTriangle, Loader2, Trash2, Wallet } from 'lucide-react';
import type { StudentRecord } from '../types';
import type { RegistrationPaymentStatusRow } from '@/features/financial/types';
import { formatCentsToBRL } from '@/shared/utils/currency';
import { useDeleteRegistration } from '../hooks/useDeleteRegistration';

interface DeleteRegistrationDialogProps {
  student: StudentRecord;
  paymentStatus?: RegistrationPaymentStatusRow;
  editionId?: string;
  onClose: () => void;
  onDeleted: () => void;
}

const WEEK_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9'] as const;

export function DeleteRegistrationDialog({
  student,
  paymentStatus,
  editionId,
  onClose,
  onDeleted,
}: DeleteRegistrationDialogProps) {
  const deleteMutation = useDeleteRegistration(editionId);

  const paidCents = paymentStatus?.total_paid_cents ?? 0;
  const hasPayments = paidCents > 0;
  const attendanceCount = WEEK_KEYS.filter((key) => student[key] === true).length;

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(student.id);
      onDeleted();
    } catch {
      // Mensagem exibida a partir de deleteMutation.error
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-registration-title"
    >
      <div className="bg-white rounded-[28px] border border-slate-200 shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <span
            className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
              hasPayments ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-600'
            }`}
          >
            {hasPayments ? <Wallet className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </span>
          <div className="min-w-0">
            <h3 id="delete-registration-title" className="text-base font-bold text-slate-900">
              {hasPayments ? 'Não é possível excluir' : 'Excluir inscrito?'}
            </h3>
            <p className="text-sm text-slate-600 mt-0.5 break-words">{student.name}</p>
          </div>
        </div>

        {hasPayments ? (
          <p className="text-sm text-slate-600 leading-relaxed">
            Este aluno tem <strong>{formatCentsToBRL(paidCents)}</strong> em pagamentos registrados. Para
            proteger o caixa, estorne os pagamentos no menu <strong>Financeiro</strong> antes de excluir.
          </p>
        ) : (
          <div className="text-sm text-slate-600 leading-relaxed flex flex-col gap-2">
            <p>A inscrição será excluída permanentemente. Esta ação não pode ser desfeita.</p>
            {attendanceCount > 0 && (
              <p className="text-rose-700 font-medium">
                {attendanceCount} {attendanceCount === 1 ? 'presença registrada será apagada' : 'presenças registradas serão apagadas'}.
              </p>
            )}
          </div>
        )}

        {deleteMutation.error && (
          <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
            {deleteMutation.error.message}
          </p>
        )}

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={deleteMutation.isPending}
            className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            {hasPayments ? 'Entendi' : 'Cancelar'}
          </button>
          {!hasPayments && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-60 inline-flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              <span>{deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
