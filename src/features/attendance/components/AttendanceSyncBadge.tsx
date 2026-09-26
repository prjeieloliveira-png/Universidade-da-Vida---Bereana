import { CloudCheck, RefreshCw, WifiOff, AlertCircle } from 'lucide-react';
import type { SyncStatus } from '../hooks/useAttendanceSync';

interface AttendanceSyncBadgeProps {
  status: SyncStatus;
  pendingCount: number;
  onForceSync?: () => void;
  compact?: boolean;
}

export function AttendanceSyncBadge({
  status,
  pendingCount,
  onForceSync,
  compact = false,
}: AttendanceSyncBadgeProps) {
  if (status === 'syncing') {
    return (
      <div
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200/80 shadow-2xs animate-pulse"
        title="Enviando presenças para o Supabase..."
      >
        <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-600" />
        <span>
          {compact
            ? `Sincronizando (${pendingCount})`
            : `Sincronizando ${pendingCount} registro(s)...`}
        </span>
      </div>
    );
  }

  if (status === 'offline' || pendingCount > 0) {
    return (
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs"
        title="Presenças salvas no navegador. Serão sincronizadas automaticamente ao restabelecer a conexão."
      >
        <WifiOff className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>
          {pendingCount > 0
            ? `${pendingCount} pendente(s)`
            : 'Modo Offline (Chamada Ativa)'}
        </span>
        {onForceSync && (
          <button
            type="button"
            onClick={onForceSync}
            className="ml-1 p-0.5 hover:bg-amber-200/70 rounded-full transition-colors cursor-pointer text-amber-900"
            title="Tentar sincronizar agora"
            aria-label="Tentar sincronizar agora"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs"
        title="Houve uma falha ao enviar. Clique no botão ao lado para tentar novamente."
      >
        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
        <span>{pendingCount} pendente(s)</span>
        {onForceSync && (
          <button
            type="button"
            onClick={onForceSync}
            className="text-[11px] underline hover:text-rose-900 font-extrabold cursor-pointer"
          >
            Reconectar
          </button>
        )}
      </div>
    );
  }

  // Status 'synced'
  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs"
      title="Todas as chamadas estão salvas e seguras no Supabase"
    >
      <CloudCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
      <span>{compact ? 'Salvo' : 'Nuvem Sincronizada'}</span>
    </div>
  );
}
