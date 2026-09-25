import React, { useState } from 'react';
import { Plus, Calendar, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { MeetingCard } from './MeetingCard';
import { MeetingModal } from './MeetingModal';
import { DeleteMeetingModal } from './DeleteMeetingModal';
import { MeetingAttendanceSheet } from './MeetingAttendanceSheet';
import type { TeamRoleRow, TeamMeetingWithDetails } from '../types/teams';
import type { useTeamMeetings } from '../hooks/useTeamMeetings';

interface MeetingListTabProps {
  roles: TeamRoleRow[];
  editionId: string | undefined;
  teamMeetingsHook: ReturnType<typeof useTeamMeetings>;
}

export const MeetingListTab: React.FC<MeetingListTabProps> = ({
  roles,
  editionId,
  teamMeetingsHook,
}) => {
  const {
    meetings,
    isLoading,
    isError,
    error,
    refetch,
    createMeeting,
    updateMeeting,
    deleteMeeting,
  } = teamMeetingsHook;

  const [activeAttendanceMeeting, setActiveAttendanceMeeting] =
    useState<TeamMeetingWithDetails | null>(null);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<TeamMeetingWithDetails | null>(null);
  const [meetingToDelete, setMeetingToDelete] = useState<TeamMeetingWithDetails | null>(null);

  // Se o usuário estiver na tela de chamada de uma reunião
  if (activeAttendanceMeeting) {
    return (
      <MeetingAttendanceSheet
        meeting={activeAttendanceMeeting}
        editionId={editionId}
        onBack={() => setActiveAttendanceMeeting(null)}
      />
    );
  }

  const handleOpenNew = () => {
    setEditingMeeting(null);
    setIsMeetingModalOpen(true);
  };

  const handleOpenEdit = (meeting: TeamMeetingWithDetails) => {
    setEditingMeeting(meeting);
    setIsMeetingModalOpen(true);
  };

  const handleOpenDelete = (meeting: TeamMeetingWithDetails) => {
    setMeetingToDelete(meeting);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-[#58bc75]" />
        <span className="text-xs font-semibold">Carregando reuniões...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 text-center space-y-3 my-6">
        <AlertCircle className="w-6 h-6 text-rose-600 mx-auto" />
        <p className="text-sm font-bold text-rose-900">Erro ao carregar reuniões da turma</p>
        <p className="text-xs text-rose-700">
          {error instanceof Error ? error.message : 'Falha na comunicação com o banco.'}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-full text-xs font-bold bg-white border border-rose-200 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Tentar novamente</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Action Header */}
      <div className="flex items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div>
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
            Reuniões & Encontros
          </h3>
          <p className="text-xs text-slate-400">
            {meetings.length} {meetings.length === 1 ? 'reunião agendada' : 'reuniões agendadas'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-full text-xs font-bold bg-[#58bc75] hover:bg-[#4caa68] active:bg-[#419a5c] text-white transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Reunião</span>
        </button>
      </div>

      {/* Meetings List */}
      {meetings.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-800">Nenhuma reunião agendada</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Agende encontros para convocar equipes e registrar a presença dos membros.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenNew}
            className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-full text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Agendar Primeira Reunião</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {meetings.map((meeting) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              roles={roles}
              onOpenAttendance={(m) => setActiveAttendanceMeeting(m)}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      )}

      {/* Modais */}
      <MeetingModal
        isOpen={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
        roles={roles}
        initialMeeting={editingMeeting}
        onSaveCreate={createMeeting}
        onSaveUpdate={updateMeeting}
      />

      <DeleteMeetingModal
        isOpen={Boolean(meetingToDelete)}
        onClose={() => setMeetingToDelete(null)}
        meeting={meetingToDelete}
        onConfirmDelete={deleteMeeting}
      />
    </div>
  );
};
