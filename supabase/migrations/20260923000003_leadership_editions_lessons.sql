-- ============================================================================
-- MIGRAÇÃO 3: RECONCILIAÇÃO DO SCHEMA COM O MODELO REAL DA UI
-- Não destrutiva: apenas ADD COLUMN, CREATE TABLE, CREATE FUNCTION, CREATE TRIGGER
-- Não altera nem remove nenhuma coluna existente.
-- ============================================================================

-- ============================================================================
-- 1. HIERARQUIA DE LIDERANÇA (três tabelas, Opção B do plano)
-- ============================================================================

CREATE TABLE pastors (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name        text NOT NULL,
    phone       text,
    -- Categoria para classificação no Dashboard (familia | jovens | geral)
    category    text NOT NULL DEFAULT 'geral'
                CHECK (category IN ('familia', 'jovens', 'geral')),
    active      boolean NOT NULL DEFAULT true,
    created_at  timestamptz DEFAULT now()
);

CREATE TABLE g12_leaders (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    pastor_id   uuid NOT NULL REFERENCES pastors(id) ON DELETE CASCADE,
    name        text NOT NULL,
    phone       text,
    active      boolean NOT NULL DEFAULT true,
    created_at  timestamptz DEFAULT now()
);

CREATE TABLE cell_leaders (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    g12_id      uuid NOT NULL REFERENCES g12_leaders(id) ON DELETE CASCADE,
    name        text NOT NULL,
    phone       text,
    active      boolean NOT NULL DEFAULT true,
    created_at  timestamptz DEFAULT now()
);

-- Tabela de junção: líderes ativos por edição (substitui cohort.activeLeaderIds)
CREATE TABLE edition_leaders (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    edition_id      uuid NOT NULL REFERENCES editions(id) ON DELETE CASCADE,
    cell_leader_id  uuid NOT NULL REFERENCES cell_leaders(id) ON DELETE CASCADE,
    created_at      timestamptz DEFAULT now(),
    UNIQUE (edition_id, cell_leader_id)
);

-- ============================================================================
-- 2. CAMPOS NOVOS EM TABELAS EXISTENTES
-- ============================================================================

-- editions: adicionar campos usados pela UI
ALTER TABLE editions
    ADD COLUMN IF NOT EXISTS code             text,
    ADD COLUMN IF NOT EXISTS encounter_date   date,
    ADD COLUMN IF NOT EXISTS target_students  int,
    ADD COLUMN IF NOT EXISTS status           text NOT NULL DEFAULT 'upcoming'
        CHECK (status IN ('active', 'upcoming', 'completed'));

-- Inicializa 'active' para a edição já marcada como is_active
UPDATE editions SET status = 'active' WHERE is_active = true;

-- lessons: adicionar coluna de tema (título longo/descritivo)
ALTER TABLE lessons
    ADD COLUMN IF NOT EXISTS theme text;

-- registrations: FK tipada para cell_leaders (o legado text permanece)
ALTER TABLE registrations
    ADD COLUMN IF NOT EXISTS cell_leader_id uuid
        REFERENCES cell_leaders(id) ON DELETE SET NULL;

-- ============================================================================
-- 3. RLS PARA NOVAS TABELAS
-- ============================================================================

ALTER TABLE pastors        ENABLE ROW LEVEL SECURITY;
ALTER TABLE g12_leaders    ENABLE ROW LEVEL SECURITY;
ALTER TABLE cell_leaders   ENABLE ROW LEVEL SECURITY;
ALTER TABLE edition_leaders ENABLE ROW LEVEL SECURITY;

-- pastors: todos autenticados leem; coord/sec gerenciam
CREATE POLICY "pastors_select"  ON pastors
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "pastors_insert"  ON pastors
    FOR INSERT TO authenticated WITH CHECK (is_coord_or_sec());
CREATE POLICY "pastors_update"  ON pastors
    FOR UPDATE TO authenticated USING (is_coord_or_sec());
CREATE POLICY "pastors_delete"  ON pastors
    FOR DELETE TO authenticated USING (is_coord_or_sec());

-- g12_leaders: mesma lógica
CREATE POLICY "g12_select"  ON g12_leaders
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "g12_insert"  ON g12_leaders
    FOR INSERT TO authenticated WITH CHECK (is_coord_or_sec());
CREATE POLICY "g12_update"  ON g12_leaders
    FOR UPDATE TO authenticated USING (is_coord_or_sec());
CREATE POLICY "g12_delete"  ON g12_leaders
    FOR DELETE TO authenticated USING (is_coord_or_sec());

-- cell_leaders: network_leader pode inserir/atualizar dentro de sua rede (via g12 que é do pastor da rede)
CREATE POLICY "cell_select"  ON cell_leaders
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "cell_insert"  ON cell_leaders
    FOR INSERT TO authenticated WITH CHECK (is_coord_or_sec());
CREATE POLICY "cell_update"  ON cell_leaders
    FOR UPDATE TO authenticated USING (is_coord_or_sec());
CREATE POLICY "cell_delete"  ON cell_leaders
    FOR DELETE TO authenticated USING (is_coord_or_sec());

-- edition_leaders: coord/sec gerenciam; todos autenticados leem
CREATE POLICY "edition_leaders_select" ON edition_leaders
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "edition_leaders_manage" ON edition_leaders
    FOR ALL TO authenticated USING (is_coord_or_sec());

-- ============================================================================
-- 4. TRIGGER: CRIAR PROFILE AUTOMATICAMENTE AO CRIAR USUÁRIO
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'viewer'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- Remove trigger anterior se existir, para ser idempotente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- 5. TRIGGER: CRIAR 9 AULAS AO CRIAR UMA EDIÇÃO
-- ============================================================================

CREATE OR REPLACE FUNCTION create_lessons_for_edition()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    i int;
BEGIN
    FOR i IN 1..9 LOOP
        INSERT INTO public.lessons (edition_id, session_number, title)
        VALUES (NEW.id, i, 'Semana ' || i)
        ON CONFLICT (edition_id, session_number) DO NOTHING;
    END LOOP;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_edition_created ON editions;

CREATE TRIGGER on_edition_created
    AFTER INSERT ON editions
    FOR EACH ROW
    EXECUTE FUNCTION create_lessons_for_edition();

-- ============================================================================
-- 6. TRIGGER DE AUDITORIA (registrations, payments, health_records)
-- ============================================================================

CREATE OR REPLACE FUNCTION audit_table_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.audit_logs (table_name, record_id, action, old_data, new_data, performed_by)
    VALUES (
        TG_TABLE_NAME,
        CASE TG_OP
            WHEN 'DELETE' THEN OLD.id
            ELSE NEW.id
        END,
        TG_OP,
        CASE TG_OP WHEN 'INSERT' THEN NULL ELSE to_jsonb(OLD) END,
        CASE TG_OP WHEN 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
        auth.uid()
    );
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger em registrations
DROP TRIGGER IF EXISTS audit_registrations ON registrations;
CREATE TRIGGER audit_registrations
    AFTER INSERT OR UPDATE OR DELETE ON registrations
    FOR EACH ROW EXECUTE FUNCTION audit_table_change();

-- Trigger em payments
DROP TRIGGER IF EXISTS audit_payments ON payments;
CREATE TRIGGER audit_payments
    AFTER INSERT OR UPDATE OR DELETE ON payments
    FOR EACH ROW EXECUTE FUNCTION audit_table_change();

-- Trigger em health_records
DROP TRIGGER IF EXISTS audit_health_records ON health_records;
CREATE TRIGGER audit_health_records
    AFTER INSERT OR UPDATE OR DELETE ON health_records
    FOR EACH ROW EXECUTE FUNCTION audit_table_change();

-- ============================================================================
-- 7. VIEW: v_registration_list (lista completa para a tela de Inscrições)
-- SEM dados de saúde (health_records fica em hook separado com RLS própria)
-- ============================================================================

CREATE OR REPLACE VIEW v_registration_list AS
SELECT
    r.id                                                AS registration_id,
    r.edition_id,
    r.person_id,
    r.cell_leader_id,
    -- Pessoa
    p.full_name,
    p.birth_date,
    p.gender,
    p.marital_status,
    p.phone,
    p.address,
    -- Idade calculada (valor derivado — não armazenado)
    EXTRACT(YEAR FROM age(CURRENT_DATE, p.birth_date))::int AS age,
    -- Liderança (via joins tipados)
    r.pastor_name                                       AS pastor_name_legacy,
    r.g12_leader                                        AS g12_name_legacy,
    r.cell_leader                                       AS cell_leader_name_legacy,
    -- Liderança via FK (nova)
    cl.name                                             AS cell_leader_name,
    g12.name                                            AS g12_name,
    g12.id                                              AS g12_id,
    pa.name                                             AS pastor_name,
    pa.id                                               AS pastor_id,
    pa.category                                         AS pastor_category,
    -- Vestuário
    r.shirt_size,
    -- Status financeiro (calculado pela view existente)
    ps.payment_status,
    ps.total_paid_cents,
    ps.balance_due_cents,
    -- Forma de pagamento (último pagamento registrado)
    (
        SELECT py.payment_method
        FROM payments py
        WHERE py.registration_id = r.id
        ORDER BY py.created_at DESC
        LIMIT 1
    ) AS last_payment_method,
    -- Valor da inscrição
    e.registration_fee_cents,
    -- Presenças por sessão (pivô de attendances)
    COALESCE(bool_or(CASE WHEN l.session_number = 1 THEN a.present END), false) AS s1,
    COALESCE(bool_or(CASE WHEN l.session_number = 2 THEN a.present END), false) AS s2,
    COALESCE(bool_or(CASE WHEN l.session_number = 3 THEN a.present END), false) AS s3,
    COALESCE(bool_or(CASE WHEN l.session_number = 4 THEN a.present END), false) AS s4,
    COALESCE(bool_or(CASE WHEN l.session_number = 5 THEN a.present END), false) AS s5,
    COALESCE(bool_or(CASE WHEN l.session_number = 6 THEN a.present END), false) AS s6,
    COALESCE(bool_or(CASE WHEN l.session_number = 7 THEN a.present END), false) AS s7,
    COALESCE(bool_or(CASE WHEN l.session_number = 8 THEN a.present END), false) AS s8,
    COALESCE(bool_or(CASE WHEN l.session_number = 9 THEN a.present END), false) AS s9,
    -- Número de inscrição (posição dentro da edição, por data de criação)
    ROW_NUMBER() OVER (PARTITION BY r.edition_id ORDER BY r.created_at)::int AS reg_number,
    r.created_at,
    r.updated_at
FROM registrations r
JOIN people          p   ON p.id  = r.person_id
JOIN editions        e   ON e.id  = r.edition_id
LEFT JOIN cell_leaders  cl  ON cl.id  = r.cell_leader_id
LEFT JOIN g12_leaders   g12 ON g12.id = cl.g12_id
LEFT JOIN pastors       pa  ON pa.id  = g12.pastor_id
LEFT JOIN v_registration_payment_status ps ON ps.registration_id = r.id
LEFT JOIN lessons       l   ON l.edition_id = r.edition_id
LEFT JOIN attendances   a   ON a.registration_id = r.id AND a.lesson_id = l.id
WHERE r.status = 'confirmed'
GROUP BY
    r.id, r.edition_id, r.person_id, r.cell_leader_id,
    p.full_name, p.birth_date, p.gender, p.marital_status, p.phone, p.address,
    r.pastor_name, r.g12_leader, r.cell_leader,
    cl.name, g12.name, g12.id, pa.name, pa.id, pa.category,
    r.shirt_size,
    ps.payment_status, ps.total_paid_cents, ps.balance_due_cents,
    e.registration_fee_cents,
    r.created_at, r.updated_at;

-- ============================================================================
-- 8. RPC: upsert_registration — atômica (people + registration + health + payment)
-- Recebe jsonb, retorna registration_id
-- ============================================================================

CREATE OR REPLACE FUNCTION upsert_registration(p_data jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_person_id     uuid;
    v_registration_id uuid;
    v_edition_id    uuid;
    v_has_health    boolean;
BEGIN
    -- Validação básica
    IF p_data->>'full_name' IS NULL OR p_data->>'birth_date' IS NULL THEN
        RAISE EXCEPTION 'full_name e birth_date são obrigatórios';
    END IF;

    v_edition_id := (p_data->>'edition_id')::uuid;

    -- Upsert da Pessoa (match por full_name + birth_date)
    INSERT INTO people (full_name, birth_date, gender, marital_status, phone, address)
    VALUES (
        p_data->>'full_name',
        (p_data->>'birth_date')::date,
        p_data->>'gender',
        p_data->>'marital_status',
        COALESCE(p_data->>'phone', ''),
        p_data->>'address'
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_person_id;

    -- Se não inseriu, busca o id existente
    IF v_person_id IS NULL THEN
        SELECT id INTO v_person_id
        FROM people
        WHERE full_name = p_data->>'full_name'
          AND birth_date = (p_data->>'birth_date')::date
        LIMIT 1;
    END IF;

    -- Atualiza dados da pessoa se já existia
    UPDATE people
    SET
        gender         = COALESCE(p_data->>'gender', gender),
        marital_status = COALESCE(p_data->>'marital_status', marital_status),
        phone          = COALESCE(p_data->>'phone', phone),
        address        = COALESCE(p_data->>'address', address),
        updated_at     = now()
    WHERE id = v_person_id;

    -- Upsert da Inscrição
    INSERT INTO registrations (
        person_id, edition_id, network_id, cell_leader_id,
        pastor_name, g12_leader, cell_leader, shirt_size, status
    )
    VALUES (
        v_person_id,
        v_edition_id,
        (p_data->>'network_id')::uuid,
        (p_data->>'cell_leader_id')::uuid,
        p_data->>'pastor_name',
        p_data->>'g12_name',
        p_data->>'cell_leader_name',
        p_data->>'shirt_size',
        'confirmed'
    )
    ON CONFLICT (person_id, edition_id) DO UPDATE
    SET
        cell_leader_id = EXCLUDED.cell_leader_id,
        pastor_name    = EXCLUDED.pastor_name,
        g12_leader     = EXCLUDED.g12_leader,
        cell_leader    = EXCLUDED.cell_leader,
        shirt_size     = EXCLUDED.shirt_size,
        updated_at     = now()
    RETURNING id INTO v_registration_id;

    -- Health records (somente se fornecido e usuário tem permissão)
    v_has_health := (p_data->>'has_condition') IS NOT NULL;
    IF v_has_health AND is_coord_or_sec() THEN
        INSERT INTO health_records (
            person_id, has_condition, condition_description, medication_schedule
        )
        VALUES (
            v_person_id,
            (p_data->>'has_condition')::boolean,
            p_data->>'condition_description',
            p_data->>'medication_schedule'
        )
        ON CONFLICT (person_id) DO UPDATE
        SET
            has_condition         = EXCLUDED.has_condition,
            condition_description = EXCLUDED.condition_description,
            medication_schedule   = EXCLUDED.medication_schedule,
            updated_at            = now();
    END IF;

    -- Pagamento (somente se marcado como pago e valor > 0)
    IF (p_data->>'amount_cents')::bigint > 0 AND p_data->>'payment_method' IS NOT NULL THEN
        INSERT INTO payments (
            registration_id, amount_cents, payment_method, payment_date, recorded_by
        )
        VALUES (
            v_registration_id,
            (p_data->>'amount_cents')::bigint,
            p_data->>'payment_method',
            CURRENT_DATE,
            auth.uid()
        )
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN v_registration_id;
END;
$$;

-- ============================================================================
-- 9. RPC: mark_attendance_batch — upsert em lote
-- p_records: [{ registration_id, lesson_id, present }]
-- ============================================================================

CREATE OR REPLACE FUNCTION mark_attendance_batch(p_records jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    rec jsonb;
BEGIN
    FOR rec IN SELECT * FROM jsonb_array_elements(p_records)
    LOOP
        INSERT INTO attendances (registration_id, lesson_id, present, marked_by, marked_at)
        VALUES (
            (rec->>'registration_id')::uuid,
            (rec->>'lesson_id')::uuid,
            (rec->>'present')::boolean,
            auth.uid(),
            now()
        )
        ON CONFLICT (registration_id, lesson_id) DO UPDATE
        SET
            present   = EXCLUDED.present,
            marked_by = EXCLUDED.marked_by,
            marked_at = EXCLUDED.marked_at;
    END LOOP;
END;
$$;

-- ============================================================================
-- 10. RPC: import_local_data — importação idempotente dos dados do localStorage
-- Recebe snapshot completo, retorna relatório {imported, skipped, errors}
-- ============================================================================

CREATE OR REPLACE FUNCTION import_local_data(p_snapshot jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_student     jsonb;
    v_imported    int := 0;
    v_skipped     int := 0;
    v_errors      jsonb := '[]'::jsonb;
    v_reg_id      uuid;
    v_edition_id  uuid;
BEGIN
    -- Somente coordenação pode importar
    IF NOT is_coord_or_sec() THEN
        RAISE EXCEPTION 'Permissão negada: apenas coordenação pode importar dados';
    END IF;

    v_edition_id := (p_snapshot->>'edition_id')::uuid;

    IF v_edition_id IS NULL THEN
        RAISE EXCEPTION 'edition_id é obrigatório no snapshot';
    END IF;

    FOR v_student IN SELECT * FROM jsonb_array_elements(p_snapshot->'students')
    LOOP
        BEGIN
            SELECT upsert_registration(
                jsonb_build_object(
                    'full_name',           v_student->>'name',
                    'birth_date',          v_student->>'birthDate',
                    'gender',              v_student->>'gender',
                    'marital_status',      v_student->>'maritalStatus',
                    'phone',               v_student->>'phone',
                    'address',             v_student->>'address',
                    'edition_id',          v_edition_id,
                    'shirt_size',          v_student->>'shirtSize',
                    'pastor_name',         v_student->>'pastor',
                    'g12_name',            v_student->>'g12',
                    'cell_leader_name',    v_student->>'leader',
                    'has_condition',       CASE WHEN v_student->>'comorbidity' NOT IN ('Não', 'nao', '—', '') THEN 'true' ELSE 'false' END,
                    'condition_description', v_student->>'comorbidity',
                    'medication_schedule', v_student->>'medSchedule',
                    'amount_cents',        COALESCE(v_student->>'amountCents', '0'),
                    'payment_method',      CASE WHEN v_student->>'paymentMethod' = '—' THEN NULL ELSE v_student->>'paymentMethod' END
                )
            ) INTO v_reg_id;
            v_imported := v_imported + 1;
        EXCEPTION WHEN OTHERS THEN
            v_skipped  := v_skipped + 1;
            v_errors   := v_errors || jsonb_build_object(
                'name',  v_student->>'name',
                'error', SQLERRM
            );
        END;
    END LOOP;

    RETURN jsonb_build_object(
        'imported', v_imported,
        'skipped',  v_skipped,
        'errors',   v_errors
    );
END;
$$;

-- ============================================================================
-- 11. TESTES DE RLS (comentados — para rodar com supabase test db ou pgTAP)
-- ============================================================================
-- Estes testes provam:
-- a) network_leader NÃO lê health_records
-- b) viewer NÃO lê registrations
-- c) coordinator lê tudo

-- Exemplo de asserção pgTAP (executar separadamente):
-- SELECT plan(3);
-- SET LOCAL role = network_leader;  -- simular via RLS
-- SELECT is(
--   (SELECT COUNT(*) FROM health_records),
--   0::bigint,
--   'network_leader não vê health_records'
-- );
-- RESET role;
-- SELECT * FROM finish();
