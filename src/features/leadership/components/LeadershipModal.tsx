import { useState, useEffect } from 'react';
import { X, Save, Shield, Network, Users } from 'lucide-react';
import type { LeadershipRole, PastorRecord, G12Record } from '../types';

export interface LeadershipModalItem {
  id?: string;
  role: LeadershipRole;
  name: string;
  phone?: string;
  pastorId?: string;
  g12Id?: string;
}

interface LeadershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: LeadershipModalItem) => void;
  initialItem: LeadershipModalItem | null;
  pastors: PastorRecord[];
  g12s: G12Record[];
}

export function LeadershipModal({
  isOpen,
  onClose,
  onSave,
  initialItem,
  pastors,
  g12s,
}: LeadershipModalProps) {
  const [role, setRole] = useState<LeadershipRole>('PASTOR');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pastorId, setPastorId] = useState('');
  const [g12Id, setG12Id] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialItem) {
      setRole(initialItem.role);
      setName(initialItem.name || '');
      setPhone(initialItem.phone || '');
      setPastorId(initialItem.pastorId || (pastors[0]?.id ?? ''));
      setG12Id(initialItem.g12Id || (g12s[0]?.id ?? ''));
    } else {
      setRole('PASTOR');
      setName('');
      setPhone('');
      setPastorId(pastors[0]?.id ?? '');
      setG12Id(g12s[0]?.id ?? '');
    }
    setError('');
  }, [initialItem, isOpen, pastors, g12s]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O nome é obrigatório.');
      return;
    }

    if (role === 'G12' && !pastorId) {
      setError('Selecione o Pastor correspondente.');
      return;
    }

    if (role === 'LEADER' && !g12Id) {
      setError('Selecione a Rede G12 correspondente.');
      return;
    }

    onSave({
      id: initialItem?.id,
      role,
      name: name.trim(),
      phone: phone.trim(),
      pastorId,
      g12Id,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-[28px] shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[90vh] my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#e8f8ee] text-[#20693a] flex items-center justify-center font-bold">
              {role === 'PASTOR' && <Shield className="w-5 h-5" />}
              {role === 'G12' && <Network className="w-5 h-5" />}
              {role === 'LEADER' && <Users className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {initialItem?.id ? 'Editar Liderança' : 'Cadastrar Liderança'}
              </h3>
              <p className="text-xs text-slate-400">Organização e cobertura espiritual</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Role selector pills (only on create) */}
          {!initialItem?.id && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Função / Nível de Liderança
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('PASTOR')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    role === 'PASTOR'
                      ? 'bg-[#163242] text-white shadow-xs'
                      : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Pastor
                </button>
                <button
                  type="button"
                  onClick={() => setRole('G12')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    role === 'G12'
                      ? 'bg-[#163242] text-white shadow-xs'
                      : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Líder G12
                </button>
                <button
                  type="button"
                  onClick={() => setRole('LEADER')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    role === 'LEADER'
                      ? 'bg-[#163242] text-white shadow-xs'
                      : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Líder Célula
                </button>
              </div>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nome do Líder *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Pr. Luis Gonzaga, Shirlany Sampaio..."
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#58bc75] focus:outline-none"
            />
          </div>

          {/* Hierarchy fields */}
          {role === 'G12' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sob a Cobertura do Pastor *
              </label>
              <select
                value={pastorId}
                onChange={(e) => setPastorId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#58bc75] focus:outline-none"
              >
                {pastors.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {role === 'LEADER' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vinculado à Rede G12 *
              </label>
              <select
                value={g12Id}
                onChange={(e) => setG12Id(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#58bc75] focus:outline-none"
              >
                {g12s.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.pastorName})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Telefone / WhatsApp (Opcional)
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(86) 99999-9999"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#58bc75] focus:outline-none"
            />
          </div>

          {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}

          {/* Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full text-xs font-bold text-white bg-[#58bc75] hover:bg-[#4caa68] active:bg-[#3f9a5a] flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Liderança</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
