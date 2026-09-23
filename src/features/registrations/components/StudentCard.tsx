import { useState } from 'react';
import { StudentRecord } from '../types';
import { StudentAttendanceChips } from './StudentAttendanceChips';
import { PillBadge } from '@/shared/components/ui/PillBadge';
import { Pencil, ChevronDown, Printer } from 'lucide-react';
import { formatCentsToBRL } from '@/shared/utils/currency';

interface StudentCardProps {
  student: StudentRecord;
  onEdit: (student: StudentRecord) => void;
  onPrint: (student: StudentRecord) => void;
  defaultExpanded?: boolean;
}

export function StudentCard({
  student,
  onEdit,
  onPrint,
  defaultExpanded = false,
}: StudentCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const isPaid = student.status === 'Pago';

  // Format birth date to pt-BR (DD/MM/YYYY)
  const formattedBirthDate = student.birthDate
    ? student.birthDate.split('-').reverse().join('/')
    : '—';

  return (
    <article
      className={`bg-white border rounded-[24px] shadow-xs overflow-hidden transition-all duration-200 ${
        isExpanded
          ? 'border-slate-300 shadow-sm ring-1 ring-slate-200/60'
          : 'border-slate-200/80 hover:border-slate-300/80 hover:shadow-xs'
      }`}
    >
      {/* Clickable Header Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 sm:px-5 py-3.5 cursor-pointer select-none hover:bg-slate-50/70 transition-colors"
        role="button"
        aria-expanded={isExpanded}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
      >
        {/* Mobile View (< sm): 2-Tier Layout so name is NEVER truncated */}
        <div className="flex sm:hidden flex-col gap-2">
          {/* Top Row: Number, Name & Status Badge */}
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {student.photoUrl ? (
                <div className="relative shrink-0">
                  <img
                    src={student.photoUrl}
                    alt={student.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#163242] text-white flex items-center justify-center text-[8px] font-extrabold shadow-xs">
                    {student.num}
                  </span>
                </div>
              ) : (
                <span className="w-7 h-7 rounded-full bg-[#163242] text-white flex items-center justify-center text-xs font-extrabold shrink-0 shadow-2xs">
                  {student.num}
                </span>
              )}
              <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1 flex-1">
                {student.name}
              </h3>
            </div>
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
              <PillBadge
                label={student.status}
                variant={isPaid ? 'success' : 'warning'}
                size="sm"
              />
            </div>
          </div>

          {/* Bottom Row: Pastor/G12, Attendance summary, Edit & Expand */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100/70 text-[11px] text-slate-400">
            <p className="truncate flex-1 min-w-0">
              {student.pastor} • G12: {student.g12}
            </p>

            <div
              className="flex items-center gap-2 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <StudentAttendanceChips
                s1={student.s1}
                s2={student.s2}
                s3={student.s3}
                s4={student.s4}
                s5={student.s5}
                s6={student.s6}
                s7={student.s7}
                s8={student.s8}
                s9={student.s9}
              />

              <button
                onClick={() => onPrint(student)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-[#163242] active:bg-[#1f4358] flex items-center justify-center text-slate-600 hover:text-[#58bc75] transition-colors cursor-pointer"
                title="Imprimir ficha"
              >
                <Printer className="w-3 h-3" />
              </button>

              <button
                onClick={() => onEdit(student)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                title="Editar cadastro"
              >
                <Pencil className="w-3 h-3" />
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 flex items-center justify-center text-slate-600 transition-transform duration-200 cursor-pointer ${
                  isExpanded ? 'rotate-180 bg-slate-200 text-slate-800' : ''
                }`}
                title={isExpanded ? 'Recolher ficha' : 'Expandir ficha'}
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop / Tablet View (>= sm): Elegant Horizontal Bar */}
        <div className="hidden sm:flex items-center justify-between gap-3">
          {/* Left Side: Number, Name & Quick Subtitle */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {student.photoUrl ? (
              <div className="relative shrink-0">
                <img
                  src={student.photoUrl}
                  alt={student.name}
                  className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#163242] text-white flex items-center justify-center text-[8px] font-extrabold shadow-xs">
                  {student.num}
                </span>
              </div>
            ) : (
              <span className="w-7 h-7 rounded-full bg-[#163242] text-white flex items-center justify-center text-xs font-extrabold shrink-0 shadow-2xs">
                {student.num}
              </span>
            )}
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {student.name}
              </h3>
              <p className="text-[11px] text-slate-400 truncate">
                {student.pastor} • G12: {student.g12}
              </p>
            </div>
          </div>

          {/* Right Side: Status Badge, Attendance Chips, Edit & Expand Chevron */}
          <div
            className="flex items-center gap-2 sm:gap-2.5 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <PillBadge
              label={student.status}
              variant={isPaid ? 'success' : 'warning'}
              size="sm"
            />

            <StudentAttendanceChips
              s1={student.s1}
              s2={student.s2}
              s3={student.s3}
              s4={student.s4}
              s5={student.s5}
              s6={student.s6}
              s7={student.s7}
              s8={student.s8}
              s9={student.s9}
            />

            <button
              onClick={() => onPrint(student)}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#163242] active:bg-[#1f4358] flex items-center justify-center text-slate-600 hover:text-[#58bc75] transition-colors cursor-pointer"
              title="Imprimir ficha"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onEdit(student)}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
              title="Editar cadastro"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 flex items-center justify-center text-slate-600 transition-transform duration-200 cursor-pointer ${
                isExpanded ? 'rotate-180 bg-slate-200 text-slate-800' : ''
              }`}
              title={isExpanded ? 'Recolher ficha' : 'Expandir ficha'}
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>


      {/* Expandable Full Details Section */}
      {isExpanded && (
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/40 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs animate-in fade-in duration-150">
          {/* Row 1 */}
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Sexo
            </span>
            <span className="font-semibold text-slate-800">{student.gender}</span>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Data Nasc.
            </span>
            <span className="font-semibold text-slate-800">{formattedBirthDate}</span>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Idade
            </span>
            <span className="font-semibold text-slate-800">{student.age} anos</span>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Estado Civil
            </span>
            <span className="font-semibold text-slate-800">{student.maritalStatus}</span>
          </div>

          {/* Row 2 */}
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Celular
            </span>
            <span className="font-semibold text-slate-800">{student.phone}</span>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-2xs col-span-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Endereço
            </span>
            <span className="font-semibold text-slate-800 truncate block">
              {student.address}
            </span>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Camisa
            </span>
            <span className="font-semibold text-slate-800">{student.shirtSize}</span>
          </div>

          {/* Row 3 */}
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Pastor
            </span>
            <span className="font-semibold text-slate-800">{student.pastor}</span>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              G12
            </span>
            <span className="font-semibold text-slate-800">{student.g12}</span>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Líder
            </span>
            <span className="font-semibold text-slate-800">{student.leader}</span>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Inscrição / Pagamento
            </span>
            <span className="font-semibold text-slate-800 block">
              {formatCentsToBRL(student.amountCents)} • {student.paymentMethod}
            </span>
          </div>

          {/* Row 4: Health Records */}
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-2xs col-span-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Comorbidade / Alergias
            </span>
            <span
              className={`font-semibold block truncate ${
                student.comorbidity !== 'Não' ? 'text-rose-700 font-bold' : 'text-slate-700'
              }`}
            >
              {student.comorbidity}
            </span>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-2xs col-span-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Horário das Medicações
            </span>
            <span
              className={`font-semibold block truncate ${
                student.medSchedule !== 'Não' ? 'text-amber-800 font-bold' : 'text-slate-700'
              }`}
            >
              {student.medSchedule}
            </span>
          </div>
        </div>
      )}
    </article>
  );
}
