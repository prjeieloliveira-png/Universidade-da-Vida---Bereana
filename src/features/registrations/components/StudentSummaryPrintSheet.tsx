import type { CSSProperties } from 'react';
import { StudentRecord } from '../types';

interface StudentSummaryPrintSheetProps {
  students: StudentRecord[];
  cohortName: string;
}

const WEEK_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9'] as const;

function countPresences(student: StudentRecord): number {
  return WEEK_KEYS.filter((key) => Boolean(student[key])).length;
}

const th: CSSProperties = {
  textAlign: 'left',
  fontSize: 10,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: 0.4,
  color: '#475569',
  borderBottom: '2px solid #163242',
  padding: '6px 8px',
};

const td: CSSProperties = {
  fontSize: 11,
  color: '#1e293b',
  borderBottom: '1px solid #e2e8f0',
  padding: '6px 8px',
};

const centerCell: CSSProperties = { ...td, textAlign: 'center' };

/**
 * Lista resumida para impressão: uma linha por aluno (nome, G12, líder,
 * pagamento e frequência) — usa estilo inline (não classes Tailwind) porque
 * a impressão transplanta o HTML puro para uma janela sem o CSS do app.
 */
export function StudentSummaryPrintSheet({ students, cohortName }: StudentSummaryPrintSheetProps) {
  const currentDate = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14, paddingBottom: 10, borderBottom: '2px solid #163242' }}>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', margin: 0 }}>
            Universidade da Vida — Lista Resumida
          </h1>
          <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0' }}>
            {cohortName} • {students.length} aluno{students.length !== 1 ? 's' : ''} • Emitido em {currentDate}
          </p>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ display: 'table-header-group' }}>
          <tr>
            <th style={{ ...th, width: 28, textAlign: 'center' }}>Nº</th>
            <th style={th}>Nome</th>
            <th style={th}>G12</th>
            <th style={th}>Líder</th>
            <th style={{ ...th, textAlign: 'center', width: 70 }}>Pagamento</th>
            <th style={{ ...th, textAlign: 'center', width: 60 }}>Frequência</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => {
            const presences = countPresences(student);
            const isPaid = student.status === 'Pago';
            return (
              <tr key={student.id || student.num} style={{ breakInside: 'avoid' }}>
                <td style={{ ...centerCell, fontWeight: 700, color: '#64748b' }}>{student.num}</td>
                <td style={{ ...td, fontWeight: 600 }}>{student.name}</td>
                <td style={td}>{student.g12 || '—'}</td>
                <td style={td}>{student.leader && student.leader !== student.g12 ? student.leader : '—'}</td>
                <td style={{ ...centerCell, fontWeight: 700, color: isPaid ? '#0d7647' : '#b45309' }}>
                  {isPaid ? 'Pago' : 'Pendente'}
                </td>
                <td style={centerCell}>{presences}/9</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
