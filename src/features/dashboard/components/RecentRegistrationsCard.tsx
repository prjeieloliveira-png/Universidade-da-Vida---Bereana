import { ArrowUpRight } from 'lucide-react';
import { PillVariant } from '@/shared/components/ui/PillBadge';

export interface ParticipantItem {
  id: string;
  name: string;
  network: string;
  statusLabel: string;
  statusVariant: PillVariant;
  amountFormatted?: string;
  dateStr?: string;
  timeStr?: string;
}

interface RecentRegistrationsCardProps {
  participants?: ParticipantItem[];
  onViewAll?: () => void;
}

const mockParticipants: ParticipantItem[] = [
  {
    id: '1',
    name: 'Ana Clara Silva',
    network: 'Rede Família',
    statusLabel: 'Confirmado',
    statusVariant: 'success',
    amountFormatted: 'R$ 100,00',
    dateStr: 'Hoje',
    timeStr: '10:30',
  },
  {
    id: '2',
    name: 'Lucas Eduardo Santos',
    network: 'Rede Jovens',
    statusLabel: 'Pendente',
    statusVariant: 'warning',
    amountFormatted: 'R$ 50,00',
    dateStr: 'Ontem',
    timeStr: '18:45',
  },
  {
    id: '3',
    name: 'Beatriz Souza Costa',
    network: 'Rede Família',
    statusLabel: 'Confirmado',
    statusVariant: 'success',
    amountFormatted: 'R$ 100,00',
    dateStr: '22 Set',
    timeStr: '14:20',
  },
  {
    id: '4',
    name: 'Gabriel Martins',
    network: 'Rede Jovens',
    statusLabel: 'Aguardando',
    statusVariant: 'neutral',
    amountFormatted: 'R$ 0,00',
    dateStr: '20 Set',
    timeStr: '09:15',
  },
];

export function RecentRegistrationsCard({
  participants = mockParticipants,
  onViewAll,
}: RecentRegistrationsCardProps) {
  const displayItems = participants.slice(0, 4);

  return (
    <div className="bg-white border border-slate-200/70 rounded-[28px] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      {/* Header (Quixotic style) */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            Histórico de Inscrições & Pagamentos
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            Últimas movimentações confirmadas
          </p>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="w-8 h-8 rounded-full border border-slate-200/80 hover:bg-slate-50 active:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0 shadow-2xs"
          title="Ver todos os participantes"
          aria-label="Ver todos"
        >
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Table-like List matching Quixotic Payment History */}
      <div className="overflow-x-auto -mx-1">
        <div className="min-w-[480px]">
          {/* Table Header */}
          <div className="grid grid-cols-12 text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 px-2">
            <span className="col-span-5">Participante</span>
            <span className="col-span-2">Data</span>
            <span className="col-span-3">Status</span>
            <span className="col-span-2 text-right">Valor</span>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-slate-100/80">
            {displayItems.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-12 items-center py-3 px-2 hover:bg-slate-50/70 rounded-xl transition-colors"
              >
                {/* Name & Initials */}
                <div className="col-span-5 flex items-center gap-2.5 min-w-0 pr-2">
                  <div className="w-8 h-8 rounded-full bg-[#e8f7ee] text-[#0d7647] border border-[#b6e3c9]/60 flex items-center justify-center font-bold text-xs shrink-0">
                    {item.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 truncate">
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate">
                      {item.network}
                    </p>
                  </div>
                </div>

                {/* Date / Time */}
                <div className="col-span-2 text-xs text-slate-600">
                  <span className="block font-medium">{item.dateStr || 'Recent'}</span>
                  <span className="text-[10px] text-slate-400">{item.timeStr || '--:--'}</span>
                </div>

                {/* Status Dot */}
                <div className="col-span-3 flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      item.statusVariant === 'success'
                        ? 'bg-[#0d7647]'
                        : item.statusVariant === 'warning'
                        ? 'bg-amber-500'
                        : 'bg-slate-400'
                    }`}
                  />
                  <span
                    className={`text-xs font-semibold ${
                      item.statusVariant === 'success'
                        ? 'text-[#0d7647]'
                        : item.statusVariant === 'warning'
                        ? 'text-amber-700'
                        : 'text-slate-600'
                    }`}
                  >
                    {item.statusLabel}
                  </span>
                </div>

                {/* Amount */}
                <div className="col-span-2 text-right">
                  <span className="text-xs font-black text-slate-900">
                    {item.amountFormatted || 'R$ 100,00'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
