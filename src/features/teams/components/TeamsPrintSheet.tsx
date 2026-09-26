import React from 'react';
import { formatPhone } from '@/shared/utils/phone';
import type { TeamRoleRow, TeamMemberWithDetails } from '../types/teams';

interface TeamsPrintSheetProps {
  roles: TeamRoleRow[];
  members: TeamMemberWithDetails[];
  editionName: string;
  includeInactive?: boolean;
}

export const TeamsPrintSheet: React.FC<TeamsPrintSheetProps> = ({
  roles,
  members,
  editionName,
  includeInactive = false,
}) => {
  const sortedRoles = [...roles].sort((a, b) => a.sort_order - b.sort_order);

  const activeMembersCount = members.filter((m) => m.active).length;
  const filteredMembers = includeInactive ? members : members.filter((m) => m.active);

  const issueDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const issueTime = new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className="bg-white text-slate-900 mx-auto w-full max-w-[210mm] p-6 sm:p-8 print:p-0 print:max-w-none print:w-full space-y-6"
      style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
    >
      {/* Cabeçalho Oficial do Relatório */}
      <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <img
            src="/logo-uv-mark.png"
            alt="Universidade da Vida"
            className="w-11 h-12 object-contain shrink-0"
          />
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#00ab81]">
              Universidade da Vida • Igreja Bereana
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              Relação Geral de Equipes de Serviço
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Turma: <strong className="text-slate-900">{editionName}</strong> • Emitido em:{' '}
              <span>
                {issueDate} às {issueTime}
              </span>
            </p>
          </div>
        </div>

        {/* Resumo de Voluntários */}
        <div className="flex sm:flex-col items-end gap-1.5 shrink-0 text-right">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-slate-900 text-white">
            {activeMembersCount} Voluntários Ativos
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            {roles.length} Equipes Cadastradas
          </span>
        </div>
      </div>

      {/* Relação das Equipes (1 a 9) */}
      <div className="space-y-5">
        {sortedRoles.map((role) => {
          const roleMembers = filteredMembers.filter((m) => m.teamRoleId === role.id);
          const activeInRole = roleMembers.filter((m) => m.active).length;

          return (
            <div
              key={role.id}
              className="border border-slate-300 rounded-xl overflow-hidden break-inside-avoid shadow-2xs print:shadow-none print:border-slate-400"
            >
              {/* Título da Equipe */}
              <div className="bg-slate-100/90 print:bg-slate-200/80 px-3.5 py-2 border-b border-slate-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0">
                    {role.sort_order}
                  </span>
                  <h2 className="font-extrabold text-sm text-slate-900 tracking-tight">
                    {role.name}
                  </h2>
                </div>
                <span className="text-xs font-bold text-slate-600">
                  {activeInRole} {activeInRole === 1 ? 'membro ativo' : 'membros ativos'}
                  {includeInactive && roleMembers.length > activeInRole && (
                    <span className="text-slate-400 text-[11px] ml-1">
                      ({roleMembers.length - activeInRole} inativos)
                    </span>
                  )}
                </span>
              </div>

              {/* Tabela de Membros */}
              {roleMembers.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-400 italic">
                  Nenhum voluntário escalado nesta equipe
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                      <th className="py-1.5 px-3 w-8 text-center">#</th>
                      <th className="py-1.5 px-3">Nome Completo</th>
                      <th className="py-1.5 px-3 w-36">Telefone</th>
                      <th className="py-1.5 px-3 w-28 text-center">Frequência</th>
                      <th className="py-1.5 px-3">Observações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {roleMembers.map((member, idx) => (
                      <tr
                        key={member.id}
                        className={`hover:bg-slate-50/50 print:hover:bg-transparent ${
                          !member.active ? 'bg-slate-50/80 text-slate-500 opacity-70 italic' : ''
                        }`}
                      >
                        <td className="py-1.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-1.5 px-3 font-semibold text-slate-900">
                          {member.person.fullName}
                          {!member.active && (
                            <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase bg-slate-200 text-slate-600 not-italic">
                              Inativo
                            </span>
                          )}
                        </td>
                        <td className="py-1.5 px-3 font-mono text-[11px] text-slate-600">
                          {formatPhone(member.person.phone) || '—'}
                        </td>
                        <td className="py-1.5 px-3 text-center font-mono text-[11px] text-slate-700">
                          {member.attendance.fraction}{' '}
                          <span className="text-[10px] text-slate-400">
                            ({member.attendance.percentage}%)
                          </span>
                        </td>
                        <td className="py-1.5 px-3 text-slate-500 truncate max-w-xs text-[11px]">
                          {member.notes || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          );
        })}
      </div>

      {/* Rodapé Oficial da Impressão */}
      <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-[11px] text-slate-500 break-inside-avoid">
        <div>
          <p className="font-semibold text-slate-700">Universidade da Vida — Sistema Bereana</p>
          <p>Documento de uso interno da liderança e coordenação.</p>
        </div>

        <div className="text-center sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 w-64">
          <div className="border-b border-slate-400 w-full mb-1"></div>
          <p className="font-bold text-slate-700">Coordenação Geral da UV</p>
          <p className="text-[10px] text-slate-400">Visto / Assinatura</p>
        </div>
      </div>
    </div>
  );
};
