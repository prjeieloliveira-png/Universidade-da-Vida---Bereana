import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useActiveEdition } from '@/shared/hooks/useActiveEdition';
import { useUserRole } from '@/shared/hooks/useUserRole';
import { useTeamMeetings } from '../hooks/useTeamMeetings';
import { MeetingAttendanceSheet } from '../components/MeetingAttendanceSheet';

/**
 * Modo porta da chamada da equipe: abre direto a chamada de uma reunião (mesmo procedimento
 * da tela de Equipes). Exige sessão ativa no aparelho (a gravação é restrita a coordenação/secretaria).
 */
export function TeamDoorAttendancePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const meetingId = searchParams.get('reuniao');

  const { isCoordOrSec, isLoading: isAuthLoading } = useUserRole();
  const { data: edition, isLoading: isEditionLoading } = useActiveEdition();
  const { meetings, isLoading: isMeetingsLoading } = useTeamMeetings(edition?.id);

  if (isAuthLoading || isEditionLoading || isMeetingsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-slate-400 gap-3">
        <Loader2 className="w-7 h-7 animate-spin text-[#58bc75]" />
        <span className="text-xs font-semibold">Carregando chamada da equipe...</span>
      </div>
    );
  }

  if (!isCoordOrSec) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 text-center bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
        <ShieldAlert className="w-8 h-8 text-rose-500 mx-auto" />
        <h2 className="text-lg font-black text-slate-900">Acesso restrito</h2>
        <p className="text-xs text-slate-500">
          A chamada das equipes é restrita à Coordenação Geral e à Secretaria.
        </p>
      </div>
    );
  }

  const meeting = meetings.find((m) => m.id === meetingId);
  if (!meeting) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 text-center bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
        <h2 className="text-lg font-black text-slate-900">Reunião não encontrada</h2>
        <p className="text-xs text-slate-500">Confira se o link está completo ou peça um novo à coordenação.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8] p-3 sm:p-6 max-w-3xl mx-auto">
      <MeetingAttendanceSheet
        meeting={meeting}
        editionId={edition?.id}
        onBack={() => navigate('/equipes')}
      />
    </div>
  );
}
