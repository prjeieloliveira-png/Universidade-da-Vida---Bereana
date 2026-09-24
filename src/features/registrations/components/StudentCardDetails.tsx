import { StudentRecord } from '../types';
import { formatCentsToBRL } from '@/shared/utils/currency';
import type { RegistrationPaymentStatusRow } from '@/features/financial/types';

interface StudentCardDetailsProps {
  student: StudentRecord;
  paymentStatus?: RegistrationPaymentStatusRow;
}

export function StudentCardDetails({ student, paymentStatus }: StudentCardDetailsProps) {
  const formattedBirthDate = student.birthDate
    ? student.birthDate.split('-').reverse().join('/')
    : '—';

  const renderPaymentInfo = () => {
    if (!paymentStatus) {
      return `${formatCentsToBRL(student.amountCents)} • ${student.paymentMethod}`;
    }

    if (paymentStatus.status === 'paid') {
      return `${formatCentsToBRL(paymentStatus.total_paid_cents)} • Quitado`;
    }

    if (paymentStatus.status === 'partial') {
      return `Pago: ${formatCentsToBRL(paymentStatus.total_paid_cents)} • Resta: ${formatCentsToBRL(paymentStatus.outstanding_cents)}`;
    }

    return `Pendente • Taxa: ${formatCentsToBRL(paymentStatus.registration_fee_cents)}`;
  };

  return (
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
        <span className="font-semibold text-slate-800 block truncate" title={renderPaymentInfo()}>
          {renderPaymentInfo()}
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
  );
}
