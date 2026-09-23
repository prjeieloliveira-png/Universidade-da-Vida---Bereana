export type CohortStatus = 'ACTIVE' | 'UPCOMING' | 'COMPLETED';

export interface Cohort {
  id: string;
  name: string;
  code: string;
  startDate: string;
  encounterDate?: string;
  status: CohortStatus;
  targetStudents: number;
  registrationFeeCents: number;
  activeLeaderIds: string[];
  createdAt: string;
}

export interface CreateCohortInput {
  name: string;
  code?: string;
  startDate: string;
  encounterDate?: string;
  targetStudents?: number;
  registrationFeeCents?: number;
  activeLeaderIds?: string[];
}
