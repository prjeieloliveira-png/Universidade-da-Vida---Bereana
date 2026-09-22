import { useMemo } from 'react';
import { useLeadershipStore } from '@/features/leadership/store/leadershipStore';
import type { StudentRecord } from '../types';

interface RegistrationLeadershipFieldsProps {
  shirtSize: string;
  pastor: string;
  g12: string;
  leader: string;
  onChange: (updates: Partial<StudentRecord>) => void;
}

export function RegistrationLeadershipFields({
  shirtSize,
  pastor,
  g12,
  leader,
  onChange,
}: RegistrationLeadershipFieldsProps) {
  const { pastors, g12s, leaders } = useLeadershipStore();

  // Filter G12 options based on selected pastor
  const availableG12s = useMemo(() => {
    if (!pastor) return g12s;
    return g12s.filter((g) => g.pastorName === pastor);
  }, [g12s, pastor]);

  // Filter cell leaders based on selected G12 or pastor
  const availableLeaders = useMemo(() => {
    if (g12) {
      return leaders.filter((l) => l.g12Name === g12);
    }
    if (pastor) {
      return leaders.filter((l) => l.pastorName === pastor);
    }
    return leaders;
  }, [leaders, g12, pastor]);

  const handlePastorChange = (newPastor: string) => {
    const isG12Valid = g12s.some((g) => g.name === g12 && g.pastorName === newPastor);
    onChange({
      pastor: newPastor,
      g12: isG12Valid ? g12 : '',
      leader: isG12Valid ? leader : '',
    });
  };

  const handleG12Change = (newG12: string) => {
    const selectedG12 = g12s.find((g) => g.name === newG12);
    const isLeaderValid = leaders.some((l) => l.name === leader && l.g12Name === newG12);
    onChange({
      g12: newG12,
      pastor: selectedG12 ? selectedG12.pastorName : pastor,
      leader: isLeaderValid ? leader : '',
    });
  };

  const handleLeaderChange = (newLeader: string) => {
    const selectedLeader = leaders.find((l) => l.name === newLeader);
    if (selectedLeader) {
      onChange({
        leader: newLeader,
        g12: selectedLeader.g12Name || g12,
        pastor: selectedLeader.pastorName || pastor,
      });
    } else {
      onChange({ leader: newLeader });
    }
  };

  return (
    <div className="pt-4 border-t border-slate-100">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          2. Inscrição & Liderança
        </h4>
        <span className="text-[10px] font-medium text-slate-400">
          Lideranças pré-definidas vinculadas
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Shirt Size */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Tamanho da Camisa
          </label>
          <select
            value={shirtSize}
            onChange={(e) => onChange({ shirtSize: e.target.value })}
            className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#58bc75] focus:outline-none"
          >
            <option value="—">— (Não definido)</option>
            <option value="P">P</option>
            <option value="M">M</option>
            <option value="G">G</option>
            <option value="GG">GG</option>
          </select>
        </div>

        {/* Pastor */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Pastor
          </label>
          <select
            value={pastor}
            onChange={(e) => handlePastorChange(e.target.value)}
            className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#58bc75] focus:outline-none font-medium"
          >
            <option value="">Selecione o Pastor...</option>
            {pastor && !pastors.some((p) => p.name === pastor) && (
              <option value={pastor}>{pastor}</option>
            )}
            {pastors.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Líder G12 */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Líder G12
          </label>
          <select
            value={g12}
            onChange={(e) => handleG12Change(e.target.value)}
            className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#58bc75] focus:outline-none font-medium"
          >
            <option value="">Selecione a Rede G12...</option>
            {g12 && !availableG12s.some((g) => g.name === g12) && (
              <option value={g12}>{g12}</option>
            )}
            {availableG12s.map((g) => (
              <option key={g.id} value={g.name}>
                {g.name} {!pastor ? `(${g.pastorName})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Líder de Célula */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Líder de Célula
          </label>
          <select
            value={leader}
            onChange={(e) => handleLeaderChange(e.target.value)}
            className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#58bc75] focus:outline-none font-medium"
          >
            <option value="">Selecione o Líder de Célula...</option>
            {leader && !availableLeaders.some((l) => l.name === leader) && (
              <option value={leader}>{leader}</option>
            )}
            {availableLeaders.map((l) => (
              <option key={l.id} value={l.name}>
                {l.name} {!g12 ? `(G12: ${l.g12Name})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
