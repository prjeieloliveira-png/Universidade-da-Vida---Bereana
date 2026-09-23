import { StudentRecord, RegistrationFilterState } from '../types';
import { RotateCcw, Users, HeartPulse, CreditCard, Sparkles } from 'lucide-react';

interface RegistrationAdvancedFiltersDrawerProps {
  students: StudentRecord[];
  filters: RegistrationFilterState;
  onChange: <K extends keyof RegistrationFilterState>(key: K, value: RegistrationFilterState[K]) => void;
  onReset: () => void;
}

export function RegistrationAdvancedFiltersDrawer({
  students,
  filters,
  onChange,
  onReset,
}: RegistrationAdvancedFiltersDrawerProps) {
  // Extract distinct leadership values based on current hierarchy
  const pastors = Array.from(new Set(students.map((s) => s.pastor).filter(Boolean))).sort();
  
  const g12List = Array.from(
    new Set(
      students
        .filter((s) => filters.pastor === 'ALL' || s.pastor === filters.pastor)
        .map((s) => s.g12)
        .filter(Boolean)
    )
  ).sort();

  const leaders = Array.from(
    new Set(
      students
        .filter((s) => {
          const matchPastor = filters.pastor === 'ALL' || s.pastor === filters.pastor;
          const matchG12 = filters.g12 === 'ALL' || s.g12 === filters.g12;
          return matchPastor && matchG12;
        })
        .map((s) => s.leader)
        .filter(Boolean)
    )
  ).sort();

  const maritalStatuses = Array.from(new Set(students.map((s) => s.maritalStatus).filter(Boolean))).sort();
  const shirtSizes = Array.from(new Set(students.map((s) => s.shirtSize).filter((sz) => sz && sz !== '—'))).sort();

  return (
    <div className="pt-3 border-t border-slate-100 space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <Sparkles className="w-3.5 h-3.5 text-[#58bc75]" />
          <span>Filtros Detalhados de Cadastro</span>
        </div>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Limpar Todos os Filtros</span>
        </button>
      </div>

      {/* Grid of Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Sexo */}
        <div className="space-y-1">
          <label className="text-slate-500 font-medium">Sexo</label>
          <select
            value={filters.gender}
            onChange={(e) => onChange('gender', e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#58bc75] text-slate-800"
          >
            <option value="ALL">Todos os sexos</option>
            <option value="Feminino">Feminino</option>
            <option value="Masculino">Masculino</option>
          </select>
        </div>

        {/* Faixa Etária */}
        <div className="space-y-1">
          <label className="text-slate-500 font-medium">Faixa Etária</label>
          <select
            value={filters.ageRange}
            onChange={(e) => onChange('ageRange', e.target.value as RegistrationFilterState['ageRange'])}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#58bc75] text-slate-800"
          >
            <option value="ALL">Todas as idades</option>
            <option value="under18">Menores (&lt; 18 anos)</option>
            <option value="18-29">Jovens (18 a 29 anos)</option>
            <option value="30-49">Adultos (30 a 49 anos)</option>
            <option value="50+">50 anos ou mais</option>
          </select>
        </div>

        {/* Estado Civil */}
        <div className="space-y-1">
          <label className="text-slate-500 font-medium">Estado Civil</label>
          <select
            value={filters.maritalStatus}
            onChange={(e) => onChange('maritalStatus', e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#58bc75] text-slate-800"
          >
            <option value="ALL">Todos os estados civis</option>
            {maritalStatuses.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        {/* Forma de Pagamento */}
        <div className="space-y-1">
          <label className="text-slate-500 font-medium flex items-center gap-1">
            <CreditCard className="w-3 h-3 text-slate-400" /> Forma de Pagamento
          </label>
          <select
            value={filters.paymentMethod}
            onChange={(e) => onChange('paymentMethod', e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#58bc75] text-slate-800"
          >
            <option value="ALL">Todas as formas</option>
            <option value="PIX">PIX</option>
            <option value="CARTÃO">Cartão de Crédito/Débito</option>
            <option value="DINHEIRO">Dinheiro em Espécie</option>
          </select>
        </div>

        {/* Pastor de Rede */}
        <div className="space-y-1">
          <label className="text-slate-500 font-medium flex items-center gap-1">
            <Users className="w-3 h-3 text-slate-400" /> Pastor de Rede
          </label>
          <select
            value={filters.pastor}
            onChange={(e) => {
              onChange('pastor', e.target.value);
              onChange('g12', 'ALL');
              onChange('leader', 'ALL');
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#58bc75] text-slate-800"
          >
            <option value="ALL">Todos os pastores</option>
            {pastors.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Discípulo G12 */}
        <div className="space-y-1">
          <label className="text-slate-500 font-medium">Discípulo G12</label>
          <select
            value={filters.g12}
            onChange={(e) => {
              onChange('g12', e.target.value);
              onChange('leader', 'ALL');
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#58bc75] text-slate-800"
          >
            <option value="ALL">Todos os G12</option>
            {g12List.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {/* Líder de Célula */}
        <div className="space-y-1">
          <label className="text-slate-500 font-medium">Líder de Célula</label>
          <select
            value={filters.leader}
            onChange={(e) => onChange('leader', e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#58bc75] text-slate-800"
          >
            <option value="ALL">Todos os líderes</option>
            {leaders.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        {/* Camiseta e Saúde */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-slate-500 font-medium">Camiseta</label>
            <select
              value={filters.shirtSize}
              onChange={(e) => onChange('shirtSize', e.target.value)}
              className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#58bc75] text-slate-800 text-[11px]"
            >
              <option value="ALL">Todas</option>
              {shirtSizes.map((sz) => (
                <option key={sz} value={sz}>{sz}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-500 font-medium flex items-center gap-0.5 truncate">
              <HeartPulse className="w-3 h-3 text-rose-500 shrink-0" /> Saúde
            </label>
            <select
              value={filters.comorbidity}
              onChange={(e) => onChange('comorbidity', e.target.value as RegistrationFilterState['comorbidity'])}
              className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#58bc75] text-slate-800 text-[11px]"
            >
              <option value="ALL">Todos</option>
              <option value="SIM">Com restrição</option>
              <option value="NAO">Sem restrição</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
