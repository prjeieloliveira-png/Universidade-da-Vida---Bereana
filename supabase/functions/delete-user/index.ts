// Edge Function: exclui um usuário (login + perfil, via cascade).
// Só pode ser chamada por coordenação/secretaria já autenticados, e ninguém
// pode excluir a própria conta por aqui (evita se trancar fora do sistema).
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { jsonResponse, requireCoordOrSecCaller } from '../_shared/authGuard.ts';

interface DeleteUserPayload {
  user_id?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const guard = await requireCoordOrSecCaller(req, adminClient);
    if ('errorResponse' in guard) return guard.errorResponse;

    const payload = (await req.json()) as DeleteUserPayload;
    const userId = payload.user_id;

    if (!userId) {
      return jsonResponse({ error: 'Usuário inválido.' }, 400);
    }
    if (userId === guard.callerId) {
      return jsonResponse({ error: 'Você não pode excluir a própria conta.' }, 400);
    }

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteError) {
      return jsonResponse({ error: deleteError.message || 'Não foi possível excluir o usuário.' }, 400);
    }

    return jsonResponse({ id: userId }, 200);
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : 'Erro inesperado.' }, 500);
  }
});
