export type LeadershipRole = 'PASTOR' | 'G12' | 'LEADER';

export interface PastorRecord {
  id: string;
  name: string;
  phone?: string;
  active: boolean;
}

export interface G12Record {
  id: string;
  name: string;
  pastorId: string;
  pastorName: string;
  phone?: string;
  active: boolean;
}

export interface LeaderRecord {
  id: string;
  name: string;
  g12Id: string;
  g12Name: string;
  pastorName: string;
  phone?: string;
  active: boolean;
}

export interface LeadershipFormData {
  role: LeadershipRole;
  name: string;
  phone?: string;
  pastorName?: string;
  g12Name?: string;
}
