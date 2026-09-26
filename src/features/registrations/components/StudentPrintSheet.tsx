import { StudentRecord } from '../types';
import { formatCentsToBRL } from '@/shared/utils/currency';
import { useStudentPhotoUrl } from '@/shared/hooks/useStudentPhotoUrl';

interface StudentPrintSheetProps {
  student: StudentRecord;
  cohortName: string;
}

const sessions: { key: keyof StudentRecord; label: string }[] = [
  { key: 's1', label: 'S1' },
  { key: 's2', label: 'S2' },
  { key: 's3', label: 'S3' },
  { key: 's4', label: 'S4' },
  { key: 's5', label: 'S5' },
  { key: 's6', label: 'S6' },
  { key: 's7', label: 'S7' },
  { key: 's8', label: 'S8' },
  { key: 's9', label: 'S9' },
];

export function StudentPrintSheet({ student, cohortName }: StudentPrintSheetProps) {
  const photoSrc = useStudentPhotoUrl(student.photoUrl);
  const birthFormatted = student.birthDate
    ? student.birthDate.split('-').reverse().join('/')
    : '—';

  const attendedCount = sessions.filter((s) => student[s.key] === true).length;

  const hasHealth =
    student.comorbidity &&
    student.comorbidity.toLowerCase() !== 'não' &&
    student.comorbidity !== '—';

  return (
    <div
      className="w-full bg-white text-slate-900"
      style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '11px' }}
    >
      {/* ── Cabeçalho ── */}
      <div
        className="flex items-center justify-between pb-3 mb-4"
        style={{ borderBottom: '2px solid #163242' }}
      >
        <div className="flex items-center gap-3">
          <img
            src="/logo-uv-mark.png"
            alt="Universidade da Vida"
            style={{ width: '38px', height: '42px', objectFit: 'contain' }}
          />
          <div>
            <div
              className="font-black uppercase tracking-widest mb-0.5"
              style={{ color: '#163242', fontSize: '13px' }}
            >
              Universidade da Vida
            </div>
            <div style={{ color: '#00ab81', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em' }}>
              Igreja Bereana • Ficha Cadastral Oficial
            </div>
          </div>
        </div>
        <div className="text-right">
          <div style={{ color: '#94a3b8', fontSize: '9px' }}>Turma</div>
          <div className="font-bold" style={{ fontSize: '12px', color: '#163242' }}>{cohortName}</div>
          <div style={{ color: '#94a3b8', fontSize: '9px' }}>
            Emitido: {new Date().toLocaleDateString('pt-BR')}
          </div>
        </div>
      </div>

      {/* ── Número + Nome ── */}
      <div
        className="flex items-center gap-3 mb-4 p-3 rounded-xl"
        style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
      >
        <div
          className="flex items-center justify-center rounded-full font-black shrink-0"
          style={{
            width: 40, height: 40, background: '#163242', color: '#58bc75', fontSize: '15px',
          }}
        >
          {student.num}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-black truncate" style={{ fontSize: '16px', color: '#0f172a' }}>
            {student.name}
          </div>
          <div style={{ color: '#64748b', fontSize: '10px', fontWeight: 600 }}>
            {student.gender} • {student.maritalStatus} • {student.age} anos
          </div>
        </div>
        <div
          className="shrink-0 font-black rounded-lg px-3 py-1"
          style={{
            background: student.status === 'Pago' ? '#dcfce7' : '#fef9c3',
            color: student.status === 'Pago' ? '#15803d' : '#92400e',
            fontSize: '11px',
          }}
        >
          {student.status}
        </div>

        {/* Foto 3×4 */}
        {photoSrc && (
          <img
            src={photoSrc}
            alt={student.name}
            style={{
              width: 54,
              height: 72,
              objectFit: 'cover',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              flexShrink: 0,
            }}
          />
        )}
        {!photoSrc && (
          <div
            style={{
              width: 54,
              height: 72,
              borderRadius: 6,
              border: '1.5px dashed #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: '#cbd5e1',
              fontSize: '8px',
              fontWeight: 700,
              textAlign: 'center',
              lineHeight: 1.3,
            }}
          >
            Foto
            <br />
            3×4
          </div>
        )}
      </div>

      {/* ── Grid Principal ── */}
      <div className="grid grid-cols-2 gap-3 mb-3">

        {/* Dados Pessoais */}
        <Section title="1. Dados Pessoais">
          <Row label="Nascimento" value={birthFormatted} />
          <Row label="Celular" value={student.phone || '—'} />
          <Row label="Endereço" value={student.address || '—'} />
          <Row label="Camiseta" value={student.shirtSize || '—'} />
        </Section>

        {/* Liderança */}
        <Section title="2. Liderança">
          <Row label="Pastor" value={student.pastor || '—'} />
          <Row label="G12" value={student.g12 || '—'} />
          <Row label="Líder" value={student.leader || '—'} />
        </Section>
      </div>

      {/* ── Financeiro ── */}
      <div className="mb-3">
        <SectionFull title="3. Financeiro">
          <div className="grid grid-cols-3 gap-2">
            <Row label="Valor" value={formatCentsToBRL(student.amountCents)} />
            <Row label="Forma de Pagamento" value={student.paymentMethod} />
            <Row label="Status" value={student.status} highlight={student.status === 'Pendente'} />
          </div>
        </SectionFull>
      </div>

      {/* ── Frequência ── */}
      <div className="mb-3">
        <SectionFull title={`4. Frequência (${attendedCount}/${sessions.length} sessões)`}>
          <div className="flex gap-2 flex-wrap">
            {sessions.map((s) => {
              const attended = student[s.key] === true;
              return (
                <div
                  key={s.key}
                  className="flex flex-col items-center gap-0.5"
                  style={{ minWidth: 28 }}
                >
                  <div
                    style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: attended ? '#dcfce7' : '#f1f5f9',
                      border: `1.5px solid ${attended ? '#86efac' : '#e2e8f0'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', fontWeight: 700,
                      color: attended ? '#15803d' : '#94a3b8',
                    }}
                  >
                    {attended ? '✓' : '—'}
                  </div>
                  <span style={{ fontSize: '8px', fontWeight: 700, color: '#94a3b8' }}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </SectionFull>
      </div>

      {/* ── Saúde ── */}
      <div className="mb-4">
        <SectionFull title="5. Saúde">
          <div className="grid grid-cols-2 gap-2">
            <Row
              label="Comorbidade / Alergias"
              value={student.comorbidity || 'Não'}
              highlight={!!hasHealth}
            />
            <Row
              label="Horário de Medicações"
              value={student.medSchedule || 'Não'}
              highlight={!!(student.medSchedule && student.medSchedule.toLowerCase() !== 'não' && student.medSchedule !== '—')}
            />
          </div>
        </SectionFull>
      </div>

      {/* ── Assinatura ── */}
      <div
        className="flex items-end justify-between pt-3"
        style={{ borderTop: '1px solid #e2e8f0' }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ borderBottom: '1px dashed #94a3b8', marginBottom: 4, height: 24 }} />
          <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 600 }}>
            Assinatura do Participante
          </div>
        </div>
        <div style={{ width: 24 }} />
        <div style={{ flex: 1 }}>
          <div style={{ borderBottom: '1px dashed #94a3b8', marginBottom: 4, height: 24 }} />
          <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 600 }}>
            Coordenação
          </div>
        </div>
      </div>

      {/* ── Rodapé ── */}
      <div
        className="mt-3 text-center"
        style={{ fontSize: '8px', color: '#cbd5e1', borderTop: '1px solid #f1f5f9', paddingTop: 6 }}
      >
        Universidade da Vida Bereana • Documento de uso interno da coordenação
      </div>
    </div>
  );
}

/* ── Sub-componentes de layout ── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="p-3 rounded-xl"
      style={{ border: '1px solid #e2e8f0', background: '#f8fafc' }}
    >
      <div
        className="font-black uppercase mb-2"
        style={{ fontSize: '8px', letterSpacing: '0.1em', color: '#94a3b8' }}
      >
        {title}
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function SectionFull({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="p-3 rounded-xl"
      style={{ border: '1px solid #e2e8f0', background: '#f8fafc' }}
    >
      <div
        className="font-black uppercase mb-2"
        style={{ fontSize: '8px', letterSpacing: '0.1em', color: '#94a3b8' }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <span style={{ fontSize: '8px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
      <span
        className="font-semibold truncate"
        style={{ fontSize: '11px', color: highlight ? '#b91c1c' : '#0f172a', fontWeight: highlight ? 700 : 600 }}
      >
        {value || '—'}
      </span>
    </div>
  );
}
