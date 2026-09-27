import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from './cors.ts';

export function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/**
 * Valida que a requisição vem de um usuário autenticado com papel
 * coordenação/secretaria. Usado por todas as functions de gestão de usuários.
 */
export async function requireCoordOrSecCaller(
  req: Request,
  adminClient: SupabaseClient
): Promise<{ callerId: string } | { errorResponse: Response }> {
  const authHeader = req.headers.get('Authorization') ?? '';
  const callerToken = authHeader.replace(/^Bearer\s+/i, '');

  if (!callerToken) {
    return { errorResponse: jsonResponse({ error: 'Não autenticado.' }, 401) };
  }

  const { data: callerData, error: callerError } = await adminClient.auth.getUser(callerToken);
  if (callerError || !callerData?.user) {
    return { errorResponse: jsonResponse({ error: 'Sessão inválida.' }, 401) };
  }

  const { data: callerProfile, error: profileError } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', callerData.user.id)
    .maybeSingle();

  if (profileError || !callerProfile || !['coordinator', 'secretary'].includes(callerProfile.role)) {
    return {
      errorResponse: jsonResponse({ error: 'Apenas coordenação ou secretaria pode gerenciar usuários.' }, 403),
    };
  }

  return { callerId: callerData.user.id };
}
