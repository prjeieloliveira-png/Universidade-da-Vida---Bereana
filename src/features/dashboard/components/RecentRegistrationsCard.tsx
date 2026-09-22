import { PillBadge, PillVariant } from '@/shared/components/ui/PillBadge';
import { ChevronRight } from 'lucide-react';

export interface ParticipantItem {
  id: string;
  name: string;
  network: string;
  statusLabel: string;
  statusVariant: PillVariant;
  amountFormatted?: string;
}

interface RecentRegistrationsCardProps {
  participants?: ParticipantItem[];
  onViewAll?: () => void;
}

const mockParticipants: ParticipantItem[] = [
  {
    id: '1',
    name: 'Ana Clara Silva',
    network: 'Rede Família • 1ª Parcela',
    statusLabel: 'Quitado',
    statusVariant: 'success',
    amountFormatted: 'R$ 100,00',
  },
  {
    id: '2',
    name: 'Lucas Eduardo Santos',
    network: 'Rede Jovens • Parcial',
    statusLabel: 'Pendente',
    statusVariant: 'warning',
    amountFormatted: 'R$ 50,00',
  },
  {
    id: '3',
    name: 'Beatriz Souza Costa',
    network: 'Rede Família • Presença confirmada',
    statusLabel: 'Presente',
    statusVariant: 'success',
    amountFormatted: 'R$ 100,00',
  },
  {
    id: '4',
    name: 'Gabriel Martins',
    network: 'Rede Jovens • Sem pagamento',
    statusLabel: 'Aguardando',
    statusVariant: 'warning',
    amountFormatted: 'R$ 0,00',
  },
  {
    id: '5',
    name: 'Débora Cristina',
    network: 'Rede Família • Ficha Médica OK',
    statusLabel: 'Quitado',
    statusVariant: 'success',
    amountFormatted: 'R$ 100,00',
  },
];

export function RecentRegistrationsCard({
  participants = mockParticipants,
  onViewAll,
}: RecentRegistrationsCardProps) {
  return (
    <div className="bg-white border border-slate-200/70 rounded-[28px] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Inscrições Recentes
          </span>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Últimos Participantes
          </h3>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-[#2f884d] hover:text-[#256c3d] flex items-center gap-0.5 transition-colors cursor-pointer"
        >
          <span>Ver todos</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* List */}
      <div className="divide-y divide-slate-100">
        {participants.map((item) => (
          <div
            key={item.id}
            className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/70 px-1 rounded-2xl transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200/60 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                {item.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')}
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-slate-800 truncate">{item.name}</h4>
                <p className="text-[11px] text-slate-400 truncate">{item.network}</p>
              </div>
            </div>

            <div className="shrink-0">
              <PillBadge
                label={item.statusLabel}
                variant={item.statusVariant}
                size="sm"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
