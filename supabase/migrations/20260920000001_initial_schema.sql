-- ============================================================================
-- 1. ENUMS & EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('coordinator', 'secretary', 'network_leader', 'viewer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- 2. TABELAS DE DOMÍNIO
-- ============================================================================

-- Redes da igreja
CREATE TABLE IF NOT EXISTS networks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    pastor_id uuid,
    color text,
    created_at timestamptz DEFAULT now()
);

-- Perfis de usuários vinculados ao auth.users
CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL,
    full_name text NOT NULL,
    role user_role NOT NULL DEFAULT 'viewer',
    network_id uuid REFERENCES networks(id) ON DELETE SET NULL,
    phone text,
    created_at timestamptz DEFAULT now()
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_networks_pastor'
    ) THEN
        ALTER TABLE networks ADD CONSTRAINT fk_networks_pastor FOREIGN KEY (pastor_id) REFERENCES profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Pessoas (entidade cadastral permanente)
CREATE TABLE IF NOT EXISTS people (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name text NOT NULL,
    birth_date date NOT NULL,
    gender text NOT NULL CHECK (gender IN ('Masculino', 'Feminino', 'Outro')),
    marital_status text NOT NULL,
    phone text NOT NULL,
    address text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Dados sensíveis de saúde (1:1 com people, RLS estrita)
CREATE TABLE IF NOT EXISTS health_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id uuid NOT NULL UNIQUE REFERENCES people(id) ON DELETE CASCADE,
    has_condition boolean NOT NULL DEFAULT false,
    condition_description text,
    medication_schedule text,
    emergency_contact_name text,
    emergency_contact_phone text,
    notes text,
    updated_at timestamptz DEFAULT now()
);

-- Edições anuais
CREATE TABLE IF NOT EXISTS editions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    year int NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    registration_fee_cents bigint NOT NULL CHECK (registration_fee_cents >= 0),
    total_lessons int NOT NULL DEFAULT 4,
    is_active boolean NOT NULL DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Aulas / Encontros da edição
CREATE TABLE IF NOT EXISTS lessons (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    edition_id uuid NOT NULL REFERENCES editions(id) ON DELETE CASCADE,
    session_number int NOT NULL,
    title text NOT NULL,
    session_date date,
    created_at timestamptz DEFAULT now(),
    UNIQUE (edition_id, session_number)
);

-- Inscrições de participantes na edição
CREATE TABLE IF NOT EXISTS registrations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id uuid NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    edition_id uuid NOT NULL REFERENCES editions(id) ON DELETE CASCADE,
    network_id uuid REFERENCES networks(id) ON DELETE SET NULL,
    leader_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
    status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE (person_id, edition_id)
);

-- Presenças nas aulas
CREATE TABLE IF NOT EXISTS attendances (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id uuid NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    present boolean NOT NULL DEFAULT false,
    marked_at timestamptz DEFAULT now(),
    marked_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    UNIQUE (registration_id, lesson_id)
);

-- Pagamentos de inscrição (centavos)
CREATE TABLE IF NOT EXISTS payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id uuid NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    amount_cents bigint NOT NULL CHECK (amount_cents > 0),
    payment_method text NOT NULL CHECK (payment_method IN ('PIX', 'CARTÃO', 'DINHEIRO', 'TRANSFERÊNCIA', 'OUTRO')),
    payment_date date NOT NULL DEFAULT current_date,
    receipt_url text,
    notes text,
    recorded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now()
);

-- Livro caixa / transações gerais do evento
CREATE TABLE IF NOT EXISTS financial_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    edition_id uuid NOT NULL REFERENCES editions(id) ON DELETE CASCADE,
    type text NOT NULL CHECK (type IN ('revenue', 'expense')),
    category text NOT NULL,
    amount_cents bigint NOT NULL CHECK (amount_cents > 0),
    payment_method text NOT NULL,
    description text NOT NULL,
    transaction_date date NOT NULL DEFAULT current_date,
    receipt_url text,
    registration_id uuid REFERENCES registrations(id) ON DELETE SET NULL,
    recorded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now()
);

-- Tabela de auditoria
CREATE TABLE IF NOT EXISTS audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name text NOT NULL,
    record_id uuid NOT NULL,
    action text NOT NULL,
    old_data jsonb,
    new_data jsonb,
    performed_by uuid REFERENCES auth.users(id),
    performed_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 3. FUNÇÕES AUXILIARES ANTI-RECURSÃO (SECURITY DEFINER)
-- ============================================================================
CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION auth_user_network_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT network_id FROM profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION is_coord_or_sec()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role IN ('coordinator', 'secretary')
  );
$$;

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) MANDATÓRIA
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE networks ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE editions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies: profiles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid
        WHERE p.polname = 'profiles_select_all_authenticated' AND c.relname = 'profiles'
    ) THEN
        CREATE POLICY "profiles_select_all_authenticated" ON profiles
            FOR SELECT TO authenticated USING (true);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid WHERE p.polname = 'profiles_update_coordinator' AND c.relname = 'profiles'
    ) THEN
        CREATE POLICY "profiles_update_coordinator" ON profiles
            FOR ALL TO authenticated USING (is_coord_or_sec());
    END IF;
END $$;

-- Policies: networks
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy WHERE polname = 'networks_select' AND polrelid = 'networks'::regclass
    ) THEN
        CREATE POLICY "networks_select" ON networks
            FOR SELECT TO authenticated USING (true);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid WHERE p.polname = 'networks_manage' AND c.relname = 'networks'
    ) THEN
        CREATE POLICY "networks_manage" ON networks
            FOR ALL TO authenticated USING (is_coord_or_sec());
    END IF;
END $$;

-- Policies: people
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid WHERE p.polname = 'people_select' AND c.relname = 'people'
    ) THEN
        CREATE POLICY "people_select" ON people
            FOR SELECT TO authenticated USING (true);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid WHERE p.polname = 'people_manage' AND c.relname = 'people'
    ) THEN
        CREATE POLICY "people_manage" ON people
            FOR ALL TO authenticated USING (is_coord_or_sec() OR auth_user_role() = 'network_leader');
    END IF;
END $$;

-- Policies: health_records (ESTRITA: Apenas coordenação e secretaria!)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid WHERE p.polname = 'health_records_coord_sec_only' AND c.relname = 'health_records'
    ) THEN
        CREATE POLICY "health_records_coord_sec_only" ON health_records
            FOR ALL TO authenticated USING (is_coord_or_sec());
    END IF;
END $$;

-- Policies: editions & lessons
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid WHERE p.polname = 'editions_select' AND c.relname = 'editions'
    ) THEN
        CREATE POLICY "editions_select" ON editions FOR SELECT TO authenticated USING (true);
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid WHERE p.polname = 'editions_manage' AND c.relname = 'editions'
    ) THEN
        CREATE POLICY "editions_manage" ON editions FOR ALL TO authenticated USING (is_coord_or_sec());
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid WHERE p.polname = 'lessons_select' AND c.relname = 'lessons'
    ) THEN
        CREATE POLICY "lessons_select" ON lessons FOR SELECT TO authenticated USING (true);
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid WHERE p.polname = 'lessons_manage' AND c.relname = 'lessons'
    ) THEN
        CREATE POLICY "lessons_manage" ON lessons FOR ALL TO authenticated USING (is_coord_or_sec());
    END IF;
END $$;

-- Policies: registrations
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid WHERE p.polname = 'registrations_select' AND c.relname = 'registrations'
    ) THEN
        CREATE POLICY "registrations_select" ON registrations
            FOR SELECT TO authenticated
            USING (is_coord_or_sec() OR network_id = auth_user_network_id());
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid WHERE p.polname = 'registrations_manage' AND c.relname = 'registrations'
    ) THEN
        CREATE POLICY "registrations_manage" ON registrations
            FOR ALL TO authenticated
            USING (is_coord_or_sec() OR network_id = auth_user_network_id());
    END IF;
END $$;

-- Policies: attendances
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid WHERE p.polname = 'attendances_select' AND c.relname = 'attendances'
    ) THEN
        CREATE POLICY "attendances_select" ON attendances
            FOR SELECT TO authenticated
            USING (
                is_coord_or_sec() OR 
                EXISTS (
                    SELECT 1 FROM registrations r 
                    WHERE r.id = attendances.registration_id AND r.network_id = auth_user_network_id()
                )
            );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid WHERE p.polname = 'attendances_manage' AND c.relname = 'attendances'
    ) THEN
        CREATE POLICY "attendances_manage" ON attendances
            FOR ALL TO authenticated
            USING (
                is_coord_or_sec() OR 
                EXISTS (
                    SELECT 1 FROM registrations r 
                    WHERE r.id = attendances.registration_id AND r.network_id = auth_user_network_id()
                )
            );
    END IF;
END $$;

-- Policies: payments
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid WHERE p.polname = 'payments_select' AND c.relname = 'payments'
    ) THEN
        CREATE POLICY "payments_select" ON payments
            FOR SELECT TO authenticated
            USING (
                is_coord_or_sec() OR 
                EXISTS (
                    SELECT 1 FROM registrations r 
                    WHERE r.id = payments.registration_id AND r.network_id = auth_user_network_id()
                )
            );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid WHERE p.polname = 'payments_manage' AND c.relname = 'payments'
    ) THEN
        CREATE POLICY "payments_manage" ON payments
            FOR ALL TO authenticated USING (is_coord_or_sec());
    END IF;
END $$;

-- Policies: financial_transactions
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid WHERE p.polname = 'financial_transactions_coord_only' AND c.relname = 'financial_transactions'
    ) THEN
        CREATE POLICY "financial_transactions_coord_only" ON financial_transactions
            FOR ALL TO authenticated USING (is_coord_or_sec());
    END IF;
END $$;

-- Policies: audit_logs
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid WHERE p.polname = 'audit_logs_coord_only' AND c.relname = 'audit_logs'
    ) THEN
        CREATE POLICY "audit_logs_coord_only" ON audit_logs
            FOR SELECT TO authenticated USING (is_coord_or_sec());
    END IF;
END $$;

-- ============================================================================
-- 5. VIEWS DE CÁLCULO DERIVADO
-- ============================================================================
CREATE OR REPLACE VIEW v_registration_payment_status AS
SELECT 
    r.id AS registration_id,
    r.edition_id,
    r.person_id,
    COALESCE(SUM(p.amount_cents), 0) AS total_paid_cents,
    e.registration_fee_cents,
    GREATEST(0, e.registration_fee_cents - COALESCE(SUM(p.amount_cents), 0)) AS balance_due_cents,
    CASE 
        WHEN COALESCE(SUM(p.amount_cents), 0) >= e.registration_fee_cents THEN 'paid'
        WHEN COALESCE(SUM(p.amount_cents), 0) > 0 THEN 'partially_paid'
        ELSE 'pending'
    END AS payment_status
FROM registrations r
JOIN editions e ON e.id = r.edition_id
LEFT JOIN payments p ON p.registration_id = r.id
GROUP BY r.id, r.edition_id, r.person_id, e.registration_fee_cents;

CREATE OR REPLACE VIEW v_registration_attendance_summary AS
SELECT 
    r.id AS registration_id,
    r.edition_id,
    r.person_id,
    COUNT(a.id) FILTER (WHERE a.present = true) AS attended_lessons,
    e.total_lessons,
    ROUND((COUNT(a.id) FILTER (WHERE a.present = true)::numeric / GREATEST(1, e.total_lessons)) * 100, 1) AS attendance_percentage
FROM registrations r
JOIN editions e ON e.id = r.edition_id
LEFT JOIN attendances a ON a.registration_id = r.id
GROUP BY r.id, r.edition_id, r.person_id, e.total_lessons;

CREATE OR REPLACE VIEW v_edition_financial_summary AS
SELECT 
    e.id AS edition_id,
    COALESCE(SUM(ft.amount_cents) FILTER (WHERE ft.type = 'revenue'), 0) AS total_revenue_cents,
    COALESCE(SUM(ft.amount_cents) FILTER (WHERE ft.type = 'expense'), 0) AS total_expense_cents,
    (COALESCE(SUM(ft.amount_cents) FILTER (WHERE ft.type = 'revenue'), 0) -
     COALESCE(SUM(ft.amount_cents) FILTER (WHERE ft.type = 'expense'), 0)) AS net_balance_cents,
    COUNT(DISTINCT r.id) AS confirmed_registrations_count
FROM editions e
LEFT JOIN financial_transactions ft ON ft.edition_id = e.id
LEFT JOIN registrations r ON r.edition_id = e.id AND r.status = 'confirmed'
GROUP BY e.id;
