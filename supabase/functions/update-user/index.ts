// Edge Function: edita um usuário existente (email, senha, nome, papel).
// Só pode ser chamada por coordenação/secretaria já autenticados.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { jsonResponse, requireCoordOrSecCaller } from '../_shared/authGuard.ts';

const VALID_ROLES = ['coordinator', 'secretary', 'network_leader', 'viewer'] as const;
type Role = (typeof VALID_ROLES)[number];

interface UpdateUserPayload {
  user_id?: string;
  email?: string;
  /** Só é alterada quando informada; em branco mantém a senha atual. */
  password?: string;
  full_name?: string;
  role?: string;
}

function isValidRole(role: string | undefined): role is Role {
  return !!role && (VALID_ROLES as readonly string[]).includes(role);
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

    const payload = (await req.json()) as UpdateUserPayload;
    const userId = payload.user_id;
    const email = payload.email?.trim().toLowerCase();
    const password = payload.password?.trim();
    const fullName = payload.full_name?.trim();
    const role = payload.role;

    if (!userId || !email || !fullName || !isValidRole(role)) {
      return jsonResponse({ error: 'Preencha nome, email e papel válidos.' }, 400);
    }
    if (password && password.length < 6) {
      return jsonResponse({ error: 'A senha precisa ter pelo menos 6 caracteres.' }, 400);
    }

    const { error: updateAuthError } = await adminClient.auth.admin.updateUserById(userId, {
      email,
      ...(password ? { password } : {}),
      user_metadata: { full_name: fullName },
    });

    if (updateAuthError) {
      const message = updateAuthError.message?.includes('already been registered')
        ? 'Já existe outro usuário com esse email.'
        : updateAuthError.message || 'Não foi possível atualizar o login.';
      return jsonResponse({ error: message }, 400);
    }

    const { error: updateProfileError } = await adminClient
      .from('profiles')
      .update({ email, full_name: fullName, role })
      .eq('id', userId);

    if (updateProfileError) {
      return jsonResponse(
        { error: `Login atualizado, mas não foi possível salvar o perfil: ${updateProfileError.message}` },
        500
      );
    }

    return jsonResponse({ id: userId, email, full_name: fullName, role }, 200);
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : 'Erro inesperado.' }, 500);
  }
});
