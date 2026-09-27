import { supabase } from '@/shared/lib/supabase';
import type { AppUser, CreateUserInput } from '../types';

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

export async function createUser(input: CreateUserInput): Promise<AppUser> {
  const { data, error } = await supabase.functions.invoke<AppUser | { error: string }>('create-user', {
    body: input,
  });

  if (error) {
    const context = (error as { context?: Response }).context;
    let serverMessage: string | undefined;
    if (context) {
      try {
        const body = (await context.json()) as { error?: string };
        serverMessage = body?.error;
      } catch {
        // resposta sem corpo JSON legível, cai no erro genérico abaixo
      }
    }
    throw new Error(serverMessage || 'Não foi possível criar o usuário. Verifique a conexão e tente novamente.');
  }

  if (data && 'error' in data) {
    throw new Error(data.error);
  }

  return data as AppUser;
}
