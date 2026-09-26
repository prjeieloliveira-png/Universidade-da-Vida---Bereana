import type { StudentRecord } from '../types';

interface RegistrationPersonalFieldsProps {
  name: string;
  gender: string;
  birthDate: string;
  maritalStatus: string;
  phone: string;
  address: string;
  onChange: (field: keyof StudentRecord, value: unknown) => void;
}

export function RegistrationPersonalFields({
  name,
  gender,
  birthDate,
  maritalStatus,
  phone,
  address,
  onChange,
}: RegistrationPersonalFieldsProps) {
  return (
    <div>
      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
        1. Dados Pessoais
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Nome Completo
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => onChange('name', e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#58bc75] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Sexo</label>
          <select
            value={gender}
            onChange={(e) => onChange('gender', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#58bc75] focus:outline-none"
          >
            <option value="Feminino">Feminino</option>
            <option value="Masculino">Masculino</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Data de Nascimento
          </label>
          <input
            type="date"
            required
            value={birthDate}
            onChange={(e) => onChange('birthDate', e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#58bc75] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Estado Civil
          </label>
          <select
            value={maritalStatus}
            onChange={(e) => onChange('maritalStatus', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#58bc75] focus:outline-none"
          >
            <option value="Solteiro">Solteiro</option>
            <option value="Casado">Casado</option>
            <option value="Divorciado">Divorciado</option>
            <option value="Viúvo">Viúvo</option>
            <option value="União Estável">União Estável</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Celular</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="(86) 99999-0000"
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#58bc75] focus:outline-none"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Endereço
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => onChange('address', e.target.value)}
            placeholder="Rua, Número - Bairro - Cidade"
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#58bc75] focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
