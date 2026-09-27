// Edge Function: cria um novo usuário (login + perfil).
// Só pode ser chamada por coordenação/secretaria já autenticados.
// Usa a service_role (injetada automaticamente pelo runtime da function,
// nunca exposta ao navegador) para criar o login via Admin API.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const VALID_ROLES = ['coordinator', 'secretary', 'network_leader', 'viewer'] as const;
type Role = (typeof VALID_ROLES)[number];

interface CreateUserPayload {
  email?: string;
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
    const authHeader = req.headers.get('Authorization') ?? '';
    const callerToken = authHeader.replace(/^Bearer\s+/i, '');

    if (!callerToken) {
      return jsonResponse({ error: 'Não autenticado.' }, 401);
    }

    // Cliente com a service_role: usado tanto para validar o chamador quanto para criar o novo usuário.
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: callerData, error: callerError } = await adminClient.auth.getUser(callerToken);
    if (callerError || !callerData?.user) {
      return jsonResponse({ error: 'Sessão inválida.' }, 401);
    }

    const { data: callerProfile, error: profileError } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', callerData.user.id)
      .maybeSingle();

    if (profileError || !callerProfile || !['coordinator', 'secretary'].includes(callerProfile.role)) {
      return jsonResponse({ error: 'Apenas coordenação ou secretaria pode cadastrar usuários.' }, 403);
    }

    const payload = (await req.json()) as CreateUserPayload;
    const email = payload.email?.trim().toLowerCase();
    const password = payload.password ?? '';
    const fullName = payload.full_name?.trim();
    const role = payload.role;

    if (!email || !fullName || !isValidRole(role)) {
      return jsonResponse({ error: 'Preencha nome, email e papel válidos.' }, 400);
    }
    if (password.length < 6) {
      return jsonResponse({ error: 'A senha precisa ter pelo menos 6 caracteres.' }, 400);
    }

    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (createError || !created?.user) {
      const message = createError?.message?.includes('already been registered')
        ? 'Já existe um usuário com esse email.'
        : createError?.message || 'Não foi possível criar o usuário.';
      return jsonResponse({ error: message }, 400);
    }

    // Um trigger em auth.users (handle_new_user) já cria a linha em `profiles`
    // automaticamente com role='viewer'; aqui garantimos que nome/papel corretos
    // fiquem salvos, sem depender da ordem de execução do trigger.
    const { error: upsertProfileError } = await adminClient.from('profiles').upsert({
      id: created.user.id,
      email,
      full_name: fullName,
      role,
    });

    if (upsertProfileError) {
      // Desfaz o login criado para não deixar um usuário órfão sem perfil.
      await adminClient.auth.admin.deleteUser(created.user.id);
      return jsonResponse(
        { error: `Não foi possível salvar o perfil do usuário: ${upsertProfileError.message}` },
        500
      );
    }

    return jsonResponse({ id: created.user.id, email, full_name: fullName, role }, 201);
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : 'Erro inesperado.' }, 500);
  }
});

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
