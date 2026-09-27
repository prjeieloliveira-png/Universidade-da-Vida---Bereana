import type { Database } from '@/shared/types/database';

export type UserRole = Database['public']['Enums']['user_role'];

export interface AppUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
}

export interface UpdateUserInput {
  user_id: string;
  email: string;
  /** Vazio mantém a senha atual. */
  password?: string;
  full_name: string;
  role: UserRole;
}
