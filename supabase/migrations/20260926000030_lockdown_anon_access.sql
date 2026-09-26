-- ============================================================================
-- MIGRAÇÃO 000030: Fecha o acesso do papel anon (AGENTS.md §3)
-- A anon key é pública (vai no bundle), então nenhuma tabela, view ou RPC do
-- domínio pode ser acessível sem login. Remove as políticas USING (true) das
-- migrações 000018–000027, restringe health_records a coordenação/secretaria,
-- faz as views respeitarem RLS e tira o bypass de "dev mode" das RPCs.
-- Nenhum dado é alterado ou apagado.
-- ============================================================================

-- 1. REMOVER POLÍTICAS ABERTAS -------------------------------------------------
DROP POLICY IF EXISTS "people_all_access"            ON people;
DROP POLICY IF EXISTS "registrations_all_access"     ON registrations;
DROP POLICY IF EXISTS "health_records_all_access"    ON health_records;
DROP POLICY IF EXISTS "attendances_all_access"       ON attendances;
DROP POLICY IF EXISTS "pastors_all_access"           ON pastors;
DROP POLICY IF EXISTS "g12_all_access"               ON g12_leaders;
DROP POLICY IF EXISTS "cell_all_access"              ON cell_leaders;
DROP POLICY IF EXISTS "edition_leaders_all_access"   ON edition_leaders;
DROP POLICY IF EXISTS "team_members_all"             ON team_members;
DROP POLICY IF EXISTS "team_meetings_all"            ON team_meetings;
DROP POLICY IF EXISTS "team_meeting_roles_all"       ON team_meeting_roles;
DROP POLICY IF EXISTS "team_meeting_attendances_all" ON team_meeting_attendances;
DROP POLICY IF EXISTS "payments_update_coord_or_anon"               ON payments;
DROP POLICY IF EXISTS "financial_transactions_update_coord_or_anon" ON financial_transactions;

-- 2. LEITURA APENAS PARA USUÁRIOS AUTENTICADOS ---------------------------------
DROP POLICY IF EXISTS "people_select" ON people;
CREATE POLICY "people_select" ON people FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "registrations_select" ON registrations;
CREATE POLICY "registrations_select" ON registrations FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "attendances_select" ON attendances;
CREATE POLICY "attendances_select" ON attendances FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "pastors_select" ON pastors;
CREATE POLICY "pastors_select" ON pastors FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "g12_select" ON g12_leaders;
CREATE POLICY "g12_select" ON g12_leaders FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "cell_select" ON cell_leaders;
CREATE POLICY "cell_select" ON cell_leaders FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "edition_leaders_select" ON edition_leaders;
CREATE POLICY "edition_leaders_select" ON edition_leaders FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "editions_select" ON editions;
CREATE POLICY "editions_select" ON editions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "lessons_select" ON lessons;
CREATE POLICY "lessons_select" ON lessons FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "cash_categories_select" ON cash_categories;
CREATE POLICY "cash_categories_select" ON cash_categories FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "team_roles_select" ON team_roles;
CREATE POLICY "team_roles_select" ON team_roles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "tmp_select" ON team_member_payments;
CREATE POLICY "tmp_select" ON team_member_payments FOR SELECT TO authenticated USING (true);

-- 3. DADOS DE SAÚDE: SOMENTE COORDENAÇÃO E SECRETARIA --------------------------
DROP POLICY IF EXISTS "health_records_coord_sec" ON health_records;
CREATE POLICY "health_records_coord_sec" ON health_records
    FOR ALL TO authenticated
    USING (is_coord_or_sec())
    WITH CHECK (is_coord_or_sec());

-- 4. POLÍTICAS DE ESCRITA QUE SÓ EXISTIAM NA VERSÃO ABERTA ---------------------
DROP POLICY IF EXISTS "attendances_manage" ON attendances;
CREATE POLICY "attendances_manage" ON attendances
    FOR ALL TO authenticated
    USING (
        is_coord_or_sec() OR EXISTS (
            SELECT 1 FROM registrations r
            WHERE r.id = attendances.registration_id
              AND r.network_id = auth_user_network_id()
        )
    )
    WITH CHECK (
        is_coord_or_sec() OR EXISTS (
            SELECT 1 FROM registrations r
            WHERE r.id = attendances.registration_id
              AND r.network_id = auth_user_network_id()
        )
    );

DROP POLICY IF EXISTS "team_members_coord_sec" ON team_members;
CREATE POLICY "team_members_coord_sec" ON team_members
    FOR ALL TO authenticated USING (is_coord_or_sec()) WITH CHECK (is_coord_or_sec());

DROP POLICY IF EXISTS "team_meetings_coord_sec" ON team_meetings;
CREATE POLICY "team_meetings_coord_sec" ON team_meetings
    FOR ALL TO authenticated USING (is_coord_or_sec()) WITH CHECK (is_coord_or_sec());

DROP POLICY IF EXISTS "team_meeting_roles_coord_sec" ON team_meeting_roles;
CREATE POLICY "team_meeting_roles_coord_sec" ON team_meeting_roles
    FOR ALL TO authenticated USING (is_coord_or_sec()) WITH CHECK (is_coord_or_sec());

DROP POLICY IF EXISTS "team_meeting_attendances_coord_sec" ON team_meeting_attendances;
CREATE POLICY "team_meeting_attendances_coord_sec" ON team_meeting_attendances
    FOR ALL TO authenticated USING (is_coord_or_sec()) WITH CHECK (is_coord_or_sec());

-- 5. VIEWS PASSAM A RESPEITAR A RLS DE QUEM CONSULTA ---------------------------
DO $$
DECLARE
    v_view text;
BEGIN
    FOREACH v_view IN ARRAY ARRAY[
        'v_cash_flow', 'v_cash_summary', 'v_edition_attendance_matrix',
        'v_edition_financial_summary', 'v_leadership_hierarchy',
        'v_registration_attendance_summary', 'v_registration_payment_status',
        'v_team_member_attendance', 'v_team_member_payment_status'
    ]
    LOOP
        EXECUTE format('ALTER VIEW public.%I SET (security_invoker = true)', v_view);
        EXECUTE format('REVOKE ALL ON public.%I FROM anon', v_view);
    END LOOP;
END;
$$;

-- 6. RPCs: CHECAGEM DE PAPEL OBRIGATÓRIA ---------------------------------------
-- Os corpos atuais são preservados; só a checagem de permissão é alterada.
-- Cada patch falha a migração se o trecho esperado não for encontrado.
DO $$
DECLARE
    v_fn    text;
    v_def   text;
    v_new   text;
    v_check text;
BEGIN
    -- 6a. Remove o bypass "dev mode" (anon, sem auth.uid(), passava direto)
    FOREACH v_fn IN ARRAY ARRAY[
        'import_legacy_payments', 'mark_team_attendance_batch', 'register_payment',
        'register_team_member_payment', 'void_financial_transaction',
        'void_payment', 'void_team_member_payment'
    ]
    LOOP
        SELECT pg_get_functiondef(p.oid) INTO STRICT v_def
        FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public' AND p.proname = v_fn;

        v_new := replace(v_def,
            'IF auth.uid() IS NOT NULL AND NOT is_coord_or_sec() THEN',
            'IF NOT is_coord_or_sec() THEN');
        IF v_new = v_def THEN
            RAISE EXCEPTION 'Bypass dev não encontrado em %', v_fn;
        END IF;
        EXECUTE v_new;
    END LOOP;

    -- 6b. Adiciona checagem nas RPCs que não tinham nenhuma
    FOREACH v_fn IN ARRAY ARRAY[
        'upsert_student_registration', 'sync_students_from_local',
        'record_attendance_rpc', 'sync_attendances_rpc', 'mark_attendance_batch'
    ]
    LOOP
        SELECT pg_get_functiondef(p.oid) INTO STRICT v_def
        FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public' AND p.proname = v_fn;

        IF v_fn IN ('upsert_student_registration', 'sync_students_from_local') THEN
            v_check := E'  IF NOT is_coord_or_sec() THEN\n'
                    || E'    RAISE EXCEPTION ''Permissão negada: apenas coordenação ou secretaria pode salvar inscrições''\n'
                    || E'      USING ERRCODE = ''42501'';\n'
                    || E'  END IF;\n';
        ELSE
            v_check := E'  IF NOT (is_coord_or_sec() OR auth_user_role() = ''network_leader'') THEN\n'
                    || E'    RAISE EXCEPTION ''Permissão negada: faça login para registrar presença''\n'
                    || E'      USING ERRCODE = ''42501'';\n'
                    || E'  END IF;\n';
        END IF;

        -- Primeiro BEGIN sem indentação = início do corpo da função
        v_new := regexp_replace(v_def, E'\nBEGIN\n', E'\nBEGIN\n' || v_check);
        IF v_new = v_def THEN
            RAISE EXCEPTION 'BEGIN de topo não encontrado em %', v_fn;
        END IF;
        EXECUTE v_new;
    END LOOP;
END;
$$;

-- 7. RPCs: EXECUTE SOMENTE PARA AUTENTICADOS -----------------------------------
-- No Postgres o EXECUTE vem para PUBLIC por padrão; revogar só de anon não basta.
DO $$
DECLARE
    v_sig regprocedure;
BEGIN
    FOR v_sig IN
        SELECT p.oid::regprocedure
        FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public'
          AND p.proname IN (
              'delete_registration', 'import_legacy_payments', 'import_local_data',
              'mark_attendance_batch', 'mark_team_attendance_batch',
              'record_attendance_rpc', 'register_payment',
              'register_team_member_payment', 'sync_attendances_rpc',
              'sync_students_from_local', 'upsert_registration',
              'upsert_student_registration', 'void_financial_transaction',
              'void_payment', 'void_team_member_payment'
          )
    LOOP
        EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon', v_sig);
        EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', v_sig);
    END LOOP;
END;
$$;

-- Funções criadas em migrações futuras não nascem executáveis por anon
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
    REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon;
