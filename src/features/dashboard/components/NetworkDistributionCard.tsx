import { Users, Heart, Sparkles } from 'lucide-react';

interface NetworkDistributionCardProps {
  familyPercentage?: number;
  youthPercentage?: number;
}

export function NetworkDistributionCard({
  familyPercentage = 68,
  youthPercentage = 32,
}: NetworkDistributionCardProps) {
  return (
    <div className="bg-[#163242] text-white border border-[#102734] rounded-[28px] p-5 sm:p-6 shadow-sm flex flex-col justify-between">
      {/* Top Network: Família */}
      <div className="pb-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#58bc75]">
            <Heart className="w-4 h-4" />
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/15 text-[#58bc75]">
            +2.6% ↑
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-white">
            {familyPercentage}%
          </span>
          <span className="text-xs text-slate-300 font-medium">Rede Família</span>
        </div>
      </div>

      {/* Bottom Network: Jovens */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-cyan-400">
            <Users className="w-4 h-4" />
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/15 text-cyan-300">
            +1.8% ↑
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-white">
            {youthPercentage}%
          </span>
          <span className="text-xs text-slate-300 font-medium">Rede Jovens</span>
        </div>
      </div>

      {/* Footer Sub-indicator */}
      <div className="mt-3 pt-2 text-[11px] text-slate-400 flex items-center gap-1">
        <Sparkles className="w-3 h-3 text-[#58bc75]" />
        <span>Divisão equilibrada entre redes</span>
      </div>
    </div>
  );
}
