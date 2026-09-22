import { ChevronRight } from 'lucide-react';

interface RegistrationGaugeCardProps {
  totalRegistered?: number;
  maxCapacity?: number;
  familyCount?: number;
  youthCount?: number;
  onViewAll?: () => void;
}

export function RegistrationGaugeCard({
  totalRegistered = 42,
  maxCapacity = 50,
  familyCount = 26,
  youthCount = 16,
  onViewAll,
}: RegistrationGaugeCardProps) {
  const remaining = Math.max(0, maxCapacity - totalRegistered);

  return (
    <div className="bg-white border border-slate-200/70 rounded-[28px] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Capacidade da Turma
          </span>
          <h3 className="text-base font-bold text-slate-800 tracking-tight">
            Alunos Matriculados
          </h3>
        </div>
        <button
          onClick={onViewAll}
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
          title="Ver todos"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Semi-Circle Half-Doughnut Gauge Arc (SVG) */}
      <div className="relative flex flex-col items-center justify-center my-3">
        <svg viewBox="0 0 200 115" className="w-48 sm:w-56 overflow-visible">
          {/* Background Arc (Unfilled) */}
          <path
            d="M 20 105 A 80 80 0 0 1 180 105"
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="20"
            strokeLinecap="round"
          />
          {/* Family Arc (Mint Green) */}
          <path
            d="M 20 105 A 80 80 0 0 1 115 26"
            fill="none"
            stroke="#58bc75"
            strokeWidth="20"
            strokeLinecap="round"
          />
          {/* Youth Arc (Deep Petrol Navy) */}
          <path
            d="M 120 27 A 80 80 0 0 1 165 70"
            fill="none"
            stroke="#163242"
            strokeWidth="20"
            strokeLinecap="round"
          />
        </svg>

        {/* Central Counter */}
        <div className="absolute top-10 flex flex-col items-center">
          <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {totalRegistered}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">de {maxCapacity} vagas</span>
        </div>
      </div>

      {/* Breakdown Legend */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#58bc75]" />
            <span className="text-slate-600">Rede da Família</span>
          </div>
          <span className="font-bold text-slate-900">{familyCount} alunos</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#163242]" />
            <span className="text-slate-600">Rede de Jovens</span>
          </div>
          <span className="font-bold text-slate-900">{youthCount} alunos</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
            <span className="text-slate-400">Vagas Disponíveis</span>
          </div>
          <span className="font-bold text-slate-400">{remaining} vagas</span>
        </div>
      </div>
    </div>
  );
}
