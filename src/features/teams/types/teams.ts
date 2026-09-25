import type { Database } from '@/shared/types/database';

export type TeamRoleRow = Database['public']['Tables']['team_roles']['Row'];
export type TeamMemberRow = Database['public']['Tables']['team_members']['Row'];
export type TeamMeetingRow = Database['public']['Tables']['team_meetings']['Row'];
export type TeamMeetingRoleRow = Database['public']['Tables']['team_meeting_roles']['Row'];
export type TeamMeetingAttendanceRow =
  Database['public']['Tables']['team_meeting_attendances']['Row'];
export type TeamMemberAttendanceViewRow =
  Database['public']['Views']['v_team_member_attendance']['Row'];

export interface TeamMemberWithDetails {
  id: string;
  editionId: string;
  teamRoleId: string;
  personId: string;
  active: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  person: {
    id: string;
    fullName: string;
    phone: string;
  };
  teamRole: {
    id: string;
    name: string;
    sortOrder: number;
  };
  attendance: {
    totalCalled: number;
    attended: number;
    percentage: number;
    fraction: string;
  };
}

export interface TeamWithMembers {
  role: TeamRoleRow;
  members: TeamMemberWithDetails[];
  activeCount: number;
  totalCount: number;
}

export interface TeamMeetingWithDetails {
  id: string;
  editionId: string;
  meetingDate: string;
  title: string | null;
  notes: string | null;
  createdBy: string | null;
  createdAt: string;
  convocadasRoleIds: string[];
  attendanceSummary: {
    attendedCount: number;
    calledCount: number;
    percentage: number;
  };
}

export interface TeamMemberAttendanceItem {
  memberId: string;
  personName: string;
  personPhone: string;
  teamRoleId: string;
  teamRoleName: string;
  present: boolean;
  markedAt: string | null;
}

export interface CreateTeamMemberInput {
  fullName: string;
  phone: string;
  teamRoleId: string;
  notes?: string;
  personId?: string;
}

export interface UpdateTeamMemberInput {
  id: string;
  fullName: string;
  phone: string;
  teamRoleId: string;
  notes?: string;
  active?: boolean;
}

export interface CreateTeamMeetingInput {
  meetingDate: string;
  title?: string;
  notes?: string;
  roleIds: string[];
}

export interface UpdateTeamMeetingInput {
  id: string;
  meetingDate: string;
  title?: string;
  notes?: string;
  roleIds: string[];
}
