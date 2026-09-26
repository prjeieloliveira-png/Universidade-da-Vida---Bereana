import { Phone, Mail, Sparkles } from 'lucide-react';

interface CoordinatorHeroCardProps {
  name?: string;
  role?: string;
  church?: string;
}

export function CoordinatorHeroCard({
  name = 'Pr. Jeiel Oliveira',
  role = 'Coordenação Geral',
  church = 'Igreja Bereana',
}: CoordinatorHeroCardProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#eaf4ef] to-[#d8ede1] border border-[#c4e3d0] rounded-[28px] p-5 sm:p-6 shadow-xs flex flex-col justify-between min-h-[290px]">
      {/* Top Floating Badge */}
      <div className="flex items-center justify-between z-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/75 backdrop-blur-md text-white text-[11px] font-medium rounded-full shadow-xs">
          <Sparkles className="w-3 h-3 text-[#58bc75]" />
          Edição 2026 Ativa
        </span>
        <img
          src="/logo-uv-mark.png"
          alt="Universidade da Vida"
          className="w-6 h-7 object-contain drop-shadow-xs"
        />
      </div>

      {/* Decorative Illustration / Avatar Center */}
      <div className="my-auto flex justify-center items-center py-4 z-0">
        <div className="relative">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-[#163242] to-[#2b5a74] p-1 shadow-md">
            <div className="w-full h-full rounded-full bg-[#1e4155] flex items-center justify-center text-white font-bold text-2xl sm:text-3xl tracking-wider">
              JO
            </div>
          </div>
          <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#58bc75] border-2 border-white shadow-xs" />
        </div>
      </div>

      {/* Bottom Floating Glass Card */}
      <div className="bg-black/80 backdrop-blur-md text-white rounded-[22px] p-3.5 flex items-center justify-between z-10 shadow-sm">
        <div className="pr-2">
          <h4 className="text-sm font-bold text-white tracking-tight">{name}</h4>
          <p className="text-[11px] text-slate-300">
            {role} • {church}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <a
            href="tel:+551199999999"
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/30 flex items-center justify-center transition-colors text-white"
            title="Ligar"
          >
            <Phone className="w-3.5 h-3.5" />
          </a>
          <a
            href="mailto:contato@bereana.com"
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/30 flex items-center justify-center transition-colors text-white"
            title="E-mail"
          >
            <Mail className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
