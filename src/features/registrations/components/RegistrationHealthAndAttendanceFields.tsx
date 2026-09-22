import type { StudentRecord } from '../types';

interface RegistrationHealthAndAttendanceFieldsProps {
  comorbidity: string;
  medSchedule: string;
  s1: boolean;
  s2: boolean;
  s3: boolean;
  s4: boolean;
  s5?: boolean;
  s6?: boolean;
  s7?: boolean;
  s8?: boolean;
  s9?: boolean;
  onChange: (field: keyof StudentRecord, value: unknown) => void;
}

export function RegistrationHealthAndAttendanceFields({
  comorbidity,
  medSchedule,
  s1,
  s2,
  s3,
  s4,
  s5 = false,
  s6 = false,
  s7 = false,
  s8 = false,
  s9 = false,
  onChange,
}: RegistrationHealthAndAttendanceFieldsProps) {
  const attendance = { s1, s2, s3, s4, s5, s6, s7, s8, s9 };

  return (
    <>
      {/* Grupo 4: Saúde & Medicações (Dados Sensíveis) */}
      <div className="pt-4 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          4. Saúde & Medicações (Dados Sensíveis)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Comorbidades / Alergias
            </label>
            <input
              type="text"
              value={comorbidity}
              onChange={(e) => onChange('comorbidity', e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#58bc75] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Horário das Medicações
            </label>
            <input
              type="text"
              value={medSchedule}
              onChange={(e) => onChange('medSchedule', e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#58bc75] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Grupo 5: Presenças nas Aulas (9 Semanas) */}
      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            5. Frequência das Aulas (9 Semanas)
          </h4>
          <span className="text-[10px] text-slate-400">Marque a presença de cada aula</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {(['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9'] as const).map((key, idx) => (
            <label
              key={key}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                attendance[key]
                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <input
                type="checkbox"
                checked={attendance[key]}
                onChange={(e) => onChange(key, e.target.checked)}
                className="w-4 h-4 text-[#58bc75] rounded-sm focus:ring-[#58bc75]"
              />
              <span className="text-xs">Semana {idx + 1}</span>
            </label>
          ))}
        </div>
      </div>
    </>
  );
}

