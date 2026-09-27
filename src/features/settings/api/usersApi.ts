import { supabase } from '@/shared/lib/supabase';
import type { AppUser, CreateUserInput, UpdateUserInput } from '../types';

export async function fetchUsers(): Promise<AppUser[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar usuários:', error);
    throw error;
  }

  return (data ?? []).map((row) => ({
    ...row,
    created_at: row.created_at ?? new Date().toISOString(),
  }));
}

/** Chama uma Edge Function de gestão de usuários e traduz o erro pro usuário final. */
async function invokeUserFunction<T>(name: string, body: object): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T | { error: string }>(name, { body });

  if (error) {
    const context = (error as { context?: Response }).context;
    let serverMessage: string | undefined;
    if (context) {
      try {
        const responseBody = (await context.json()) as { error?: string };
        serverMessage = responseBody?.error;
      } catch {
        // resposta sem corpo JSON legível, cai no erro genérico abaixo
      }
    }
    throw new Error(serverMessage || 'Não foi possível concluir a operação. Verifique a conexão e tente novamente.');
  }

  if (data && typeof data === 'object' && 'error' in data) {
    throw new Error((data as { error: string }).error);
  }

  return data as T;
}

export function createUser(input: CreateUserInput): Promise<AppUser> {
  return invokeUserFunction<AppUser>('create-user', input);
}

export function updateUser(input: UpdateUserInput): Promise<AppUser> {
  return invokeUserFunction<AppUser>('update-user', input);
}

export function deleteUser(userId: string): Promise<{ id: string }> {
  return invokeUserFunction<{ id: string }>('delete-user', { user_id: userId });
}
