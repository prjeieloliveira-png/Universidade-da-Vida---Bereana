-- ============================================================================
-- SEED DATA PARA DESENVOLVIMENTO LOCAL
-- ============================================================================

-- 0. Usuário Coordenador para desenvolvimento e testes
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000001',
  'authenticated',
  'authenticated',
  'admin@bereana.com',
  crypt('123456', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Pastor Jeiel Oliveira"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, email, full_name, role)
VALUES ('a0000000-0000-0000-0000-000000000001', 'admin@bereana.com', 'Pastor Jeiel Oliveira', 'coordinator')
ON CONFLICT (id) DO UPDATE SET role = 'coordinator';

-- 1. Redes
INSERT INTO networks (id, name, color) VALUES 
('11111111-1111-1111-1111-111111111111', 'Rede da Família (Pr. Carlos)', '#4f46e5'),
('22222222-2222-2222-2222-222222222222', 'Rede de Jovens (Pr. Mateus)', '#06b6d4')
ON CONFLICT (id) DO NOTHING;

-- 2. Edição 2026 Ativa (Inscrição R$ 100,00 = 10000 centavos)
INSERT INTO editions (id, name, year, start_date, end_date, registration_fee_cents, total_lessons, is_active) VALUES
('33333333-3333-3333-3333-333333333333', 'Universidade da Vida 2026 — 1º Semestre', 2026, '2026-03-01', '2026-04-15', 10000, 4, true)
ON CONFLICT (id) DO NOTHING;

-- 3. As 4 Aulas / Palestras da Edição
INSERT INTO lessons (id, edition_id, session_number, title, session_date) VALUES
('44444444-4444-4444-4444-444444444401', '33333333-3333-3333-3333-333333333333', 1, 'Semana 1: O Encontro com Deus', '2026-03-07'),
('44444444-4444-4444-4444-444444444402', '33333333-3333-3333-3333-333333333333', 2, 'Semana 2: Quebrando Maldições e Libertação', '2026-03-14'),
('44444444-4444-4444-4444-444444444403', '33333333-3333-3333-3333-333333333333', 3, 'Semana 3: Cura Interior e Perdão', '2026-03-21'),
('44444444-4444-4444-4444-444444444404', '33333333-3333-3333-3333-333333333333', 4, 'Semana 4: O Batismo no Espírito Santo', '2026-03-28')
ON CONFLICT (edition_id, session_number) DO UPDATE SET
    id = EXCLUDED.id,
    title = EXCLUDED.title,
    session_date = EXCLUDED.session_date;

-- 4. Pessoas (Cadastro perene)
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address) VALUES
('55555555-5555-5555-5555-555555555501', 'Ana Clara Silva', '1995-05-12', 'Feminino', 'Casado(a)', '(11) 98765-4321', 'Rua das Flores, 123'),
('55555555-5555-5555-5555-555555555502', 'Lucas Eduardo Santos', '2001-08-24', 'Masculino', 'Solteiro(a)', '(11) 91234-5678', 'Av. Paulista, 1500'),
('55555555-5555-5555-5555-555555555503', 'Beatriz Souza Costa', '1988-11-03', 'Feminino', 'Casado(a)', '(11) 99887-7665', 'Rua Augusta, 450')
ON CONFLICT (id) DO NOTHING;

-- 5. Dados sensíveis de saúde (apenas para Ana Clara e Beatriz)
INSERT INTO health_records (person_id, has_condition, condition_description, medication_schedule, emergency_contact_name, emergency_contact_phone) VALUES
('55555555-5555-5555-5555-555555555501', true, 'Hipertensão leve', 'Enalapril 10mg às 08h', 'Roberto Silva (Esposo)', '(11) 98765-0000'),
('55555555-5555-5555-5555-555555555503', false, null, null, 'Marcos Costa', '(11) 99887-0000')
ON CONFLICT (person_id) DO NOTHING;

-- 6. Inscrições na Edição 2026
INSERT INTO registrations (id, person_id, edition_id, network_id, status) VALUES
('66666666-6666-6666-6666-666666666601', '55555555-5555-5555-5555-555555555501', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'confirmed'),
('66666666-6666-6666-6666-666666666602', '55555555-5555-5555-5555-555555555502', '33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'confirmed'),
('66666666-6666-6666-6666-666666666603', '55555555-5555-5555-5555-555555555503', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'confirmed')
ON CONFLICT (id) DO NOTHING;

-- 7. Pagamentos (Ana Clara pagou integral R$ 100, Lucas pagou parcial R$ 50)
INSERT INTO payments (registration_id, amount_cents, payment_method, notes) VALUES
('66666666-6666-6666-6666-666666666601', 10000, 'pix', 'Inscrição quitada via Pix'),
('66666666-6666-6666-6666-666666666602', 5000, 'cash', '1ª parcela em dinheiro na igreja')
ON CONFLICT (id) DO NOTHING;

-- 8. Presenças (Semana 1)
INSERT INTO attendances (registration_id, lesson_id, present) VALUES
('66666666-6666-6666-6666-666666666601', '44444444-4444-4444-4444-444444444401', true),
('66666666-6666-6666-6666-666666666602', '44444444-4444-4444-4444-444444444401', true),
('66666666-6666-6666-6666-666666666603', '44444444-4444-4444-4444-444444444401', false)
ON CONFLICT (registration_id, lesson_id) DO NOTHING;
