import { ArrowUpRight, Users } from 'lucide-react';

interface TeamAvatarsCardProps {
  totalRegistered?: number;
  maxCapacity?: number;
  onViewTeams?: () => void;
  onViewRegistrations?: () => void;
}

export function TeamAvatarsCard({
  totalRegistered = 53,
  maxCapacity = 70,
  onViewTeams,
  onViewRegistrations,
}: TeamAvatarsCardProps) {
  const sampleVolunteers = [
    { name: 'Pr. Jeiel', bg: 'bg-[#0d7647] text-white', label: 'PJ' },
    { name: 'Diogo', bg: 'bg-[#163242] text-white', label: 'DG' },
    { name: 'Sarah', bg: 'bg-amber-600 text-white', label: 'SR' },
    { name: 'Caleb', bg: 'bg-emerald-700 text-white', label: 'CL' },
  ];

  const occupancyRate = Math.round((totalRegistered / maxCapacity) * 100);

  return (
    <div className="bg-white border border-slate-200/70 rounded-[28px] p-5 shadow-xs flex flex-col justify-between">
      {/* Top Section: Alunos & Capacidade */}
      <div className="pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#e8f7ee] text-[#0d7647] flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Vagas da Turma
            </span>
          </div>

          <button
            type="button"
            onClick={onViewRegistrations}
            className="text-[11px] font-bold text-[#0d7647] hover:underline cursor-pointer"
          >
            Ver alunos
          </button>
        </div>

        <div className="flex items-baseline justify-between mt-2">
          <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {totalRegistered} <span className="text-sm font-semibold text-slate-400">/ {maxCapacity}</span>
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#e8f7ee] text-[#0d7647]">
            +{occupancyRate}%
          </span>
        </div>
      </div>

      {/* Bottom Section: Equipes & Avatars */}
      <div className="pt-3">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h4 className="text-xs font-bold text-slate-800 tracking-tight">
              Equipes de Serviço
            </h4>
            <p className="text-[11px] text-slate-400">Voluntários escalados</p>
          </div>

          <button
            type="button"
            onClick={onViewTeams}
            className="w-7 h-7 rounded-full border border-slate-200/80 hover:bg-slate-50 active:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0 shadow-2xs"
            title="Ver equipes de serviço"
            aria-label="Ver equipes"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Overlapping User Avatars (Quixotic style) */}
        <div className="flex items-center -space-x-2">
          {sampleVolunteers.map((vol) => (
            <div
              key={vol.name}
              title={vol.name}
              className={`w-9 h-9 rounded-full ${vol.bg} border-2 border-white flex items-center justify-center font-bold text-xs shadow-2xs cursor-pointer hover:scale-105 transition-transform`}
            >
              {vol.label}
            </div>
          ))}

          {/* Plus Count Badge */}
          <button
            type="button"
            onClick={onViewTeams}
            className="w-9 h-9 rounded-full bg-[#0d7647] text-white border-2 border-white flex items-center justify-center font-black text-xs shadow-2xs hover:scale-105 transition-transform cursor-pointer"
            title="Ver todos os voluntários"
          >
            +9
          </button>
        </div>
      </div>
    </div>
  );
}
