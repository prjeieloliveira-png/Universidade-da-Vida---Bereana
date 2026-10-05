import React from 'react';
import { ArrowDownAZ, Search } from 'lucide-react';
import { AttendanceSyncBadge } from '@/features/attendance/components/AttendanceSyncBadge';
import type { SyncStatus } from '@/features/attendance/hooks/useAttendanceSync';

export type MeetingStatusFilter = 'ALL' | 'PRESENTE' | 'FALTA';

interface MeetingAttendanceToolbarProps {
  syncStatus: SyncStatus;
  pendingCount: number;
  onForceSync: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortAlphabetically: boolean;
  onToggleSort: () => void;
  statusFilter: MeetingStatusFilter;
  onStatusFilterChange: (value: MeetingStatusFilter) => void;
  totalCalled: number;
  totalAttended: number;
  totalAbsent: number;
}

export const MeetingAttendanceToolbar: React.FC<MeetingAttendanceToolbarProps> = ({
  syncStatus,
  pendingCount,
  onForceSync,
  searchQuery,
  onSearchChange,
  sortAlphabetically,
  onToggleSort,
  statusFilter,
  onStatusFilterChange,
  totalCalled,
  totalAttended,
  totalAbsent,
}) => (
<div className="pt-3 border-t border-slate-100 space-y-3">
  <div className="flex items-center justify-between gap-2 flex-wrap">
    <span className="text-xs text-slate-500">
      Marque <strong>Presente</strong> ou <strong>Falta</strong> em cada membro. Quem ainda não foi
      marcado fica em branco.
    </span>
    <AttendanceSyncBadge
      status={syncStatus}
      pendingCount={pendingCount}
      onForceSync={onForceSync}
    />
  </div>

  <div className="flex flex-col md:flex-row items-center gap-3">
    <div className="relative flex-1 w-full">
      <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Buscar membro por nome ou telefone..."
        className="w-full pl-11 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200/80 rounded-full focus:outline-none focus:ring-2 focus:ring-[#58bc75] focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
      />
    </div>

    <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
      <button
        type="button"
        onClick={onToggleSort}
        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer border ${
          sortAlphabetically
            ? 'bg-[#163242] text-white border-[#163242]'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-transparent'
        }`}
        title={sortAlphabetically ? 'Ordenação alfabética ativada' : 'Ordenar membros em ordem alfabética'}
        aria-pressed={sortAlphabetically}
      >
        <ArrowDownAZ className={`w-3.5 h-3.5 ${sortAlphabetically ? 'text-[#58bc75]' : 'text-slate-500'}`} />
        <span>A-Z</span>
      </button>
      <button
        type="button"
        onClick={() => onStatusFilterChange('ALL')}
        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
          statusFilter === 'ALL' ? 'bg-[#163242] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
      >
        Todos ({totalCalled})
      </button>
      <button
        type="button"
        onClick={() => onStatusFilterChange('PRESENTE')}
        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
          statusFilter === 'PRESENTE' ? 'bg-[#58bc75] text-white shadow-xs' : 'bg-[#e8f8ee] text-[#2c814b] hover:bg-[#d6f4df]'
        }`}
      >
        Presentes ({totalAttended})
      </button>
      <button
        type="button"
        onClick={() => onStatusFilterChange('FALTA')}
        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
          statusFilter === 'FALTA' ? 'bg-rose-600 text-white shadow-xs' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
        }`}
      >
        Faltas ({totalAbsent})
      </button>
    </div>
  </div>
</div>

);
