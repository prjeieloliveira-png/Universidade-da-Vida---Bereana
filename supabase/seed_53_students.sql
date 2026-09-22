-- ============================================================================
-- SEED DOS 53 ALUNOS REAIS DA UNIVERSIDADE DA VIDA 2026 (EXTRAÍDOS DO PDF)
-- ============================================================================

-- 1. Garantir Edição 2026 Ativa com Valor de R$ 200,00 (20000 centavos)
INSERT INTO editions (id, name, year, start_date, end_date, registration_fee_cents, total_lessons, is_active)
VALUES (
    '33333333-3333-3333-3333-333333333333',
    'Universidade da Vida 2026 — 1º Semestre',
    2026,
    '2026-03-01',
    '2026-04-15',
    20000,
    4,
    true
)
ON CONFLICT (id) DO UPDATE SET registration_fee_cents = 20000;

-- 2. Garantir as 4 Aulas / Palestras da Edição
INSERT INTO lessons (id, edition_id, session_number, title, session_date) VALUES
('44444444-4444-4444-4444-444444444401', '33333333-3333-3333-3333-333333333333', 1, 'Semana 1: O Encontro com Deus', '2026-03-07'),
('44444444-4444-4444-4444-444444444402', '33333333-3333-3333-3333-333333333333', 2, 'Semana 2: Quebrando Maldições e Libertação', '2026-03-14'),
('44444444-4444-4444-4444-444444444403', '33333333-3333-3333-3333-333333333333', 3, 'Semana 3: Cura Interior e Perdão', '2026-03-21'),
('44444444-4444-4444-4444-444444444404', '33333333-3333-3333-3333-333333333333', 4, 'Semana 4: O Batismo no Espírito Santo', '2026-03-28')
ON CONFLICT (id) DO NOTHING;


-- [1] Alana Mikaela Macedo Nascimento da Silva
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550001', 'Alana Mikaela Macedo Nascimento da Silva', '1997-04-21', 'Feminino', 'Solteiro', '(86) 98851-2077', 'Av Duque de Caxias , 5694 - Casa - Buenos Aires - Teresina /Piauí')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660001', '55555555-5555-5555-5555-555555550001', '33333333-3333-3333-3333-333333333333', NULL, 'Pra. Socorro Paiva', 'Shirlany Sampaio', 'Shirlany', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO payments (id, registration_id, amount_cents, payment_method, notes)
VALUES ('77777777-7777-7777-7777-777777770001', '66666666-6666-6666-6666-666666660001', 20000, 'CARTÃO', 'Inscrição Edição 2026')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660001', '44444444-4444-4444-4444-444444444401', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660001', '44444444-4444-4444-4444-444444444402', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660001', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660001', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [2] Alefhi Endrew de M Silva
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550002', 'Alefhi Endrew de M Silva', '2010-01-01', 'Masculino', 'Casado', '(86) 99999-0000', NULL)
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660002', '55555555-5555-5555-5555-555555550002', '33333333-3333-3333-3333-333333333333', NULL, 'Pr. Luis Gonzaga', 'Pr. Jeiel Oliveira Santos', 'Adão', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO payments (id, registration_id, amount_cents, payment_method, notes)
VALUES ('77777777-7777-7777-7777-777777770002', '66666666-6666-6666-6666-666666660002', 20000, 'PIX', 'Inscrição Edição 2026')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660002', '44444444-4444-4444-4444-444444444401', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660002', '44444444-4444-4444-4444-444444444402', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660002', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660002', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [3] Ana Beatriz do Nascimento Silva
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550003', 'Ana Beatriz do Nascimento Silva', '2005-01-01', 'Feminino', 'Solteiro', '(86) 99929-0043', 'Povoado Fazenda Soares')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660003', '55555555-5555-5555-5555-555555550003', '33333333-3333-3333-3333-333333333333', 'P', 'Pra. Socorro Paiva', 'Karol Abreu', 'Gabriela Tobal', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660003', '44444444-4444-4444-4444-444444444401', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660003', '44444444-4444-4444-4444-444444444402', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660003', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660003', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [4] Ana Luiza Gomes da Silva
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550004', 'Ana Luiza Gomes da Silva', '2004-01-01', 'Feminino', 'Solteiro', '(86) 99510-9129', NULL)
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660004', '55555555-5555-5555-5555-555555550004', '33333333-3333-3333-3333-333333333333', 'P', 'Pra. Socorro Paiva', 'Karol Abreu', 'Gabriela Tobal', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660004', '44444444-4444-4444-4444-444444444401', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660004', '44444444-4444-4444-4444-444444444402', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660004', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660004', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [5] Antonio da Silva Brito
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550005', 'Antonio da Silva Brito', '2000-01-01', 'Masculino', 'Solteiro', '(86) 98405-4467', NULL)
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660005', '55555555-5555-5555-5555-555555550005', '33333333-3333-3333-3333-333333333333', NULL, 'Pr. Luis Gonzaga', 'Apollo Tobal', 'Apollo', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO payments (id, registration_id, amount_cents, payment_method, notes)
VALUES ('77777777-7777-7777-7777-777777770005', '66666666-6666-6666-6666-666666660005', 20000, 'PIX', 'Inscrição Edição 2026')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660005', '44444444-4444-4444-4444-444444444401', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660005', '44444444-4444-4444-4444-444444444402', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660005', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660005', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [6] Antônio Gomes De Alencar Neto
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550006', 'Antônio Gomes De Alencar Neto', '2000-09-30', 'Masculino', 'Solteiro', '(86) 99912-7558', 'Quadra 01, casa 09, Santa Sofia, 9 - Casa - Santa Sofia - Teresina-PI/Piauí')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660006', '55555555-5555-5555-5555-555555550006', '33333333-3333-3333-3333-333333333333', NULL, 'Pr. Luis Gonzaga', 'Apollo Tobal', 'Apollo', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO payments (id, registration_id, amount_cents, payment_method, notes)
VALUES ('77777777-7777-7777-7777-777777770006', '66666666-6666-6666-6666-666666660006', 20000, 'CARTÃO', 'Inscrição Edição 2026')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660006', '44444444-4444-4444-4444-444444444401', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660006', '44444444-4444-4444-4444-444444444402', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660006', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660006', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [7] Átila Sargão de Sousa Junior
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550007', 'Átila Sargão de Sousa Junior', '2005-02-23', 'Masculino', 'Solteiro', '(86) 98150-1554', 'Quadra 44 - Casa 7 - Setor A, 7 - Rua da Telemar - Mocambinho - Teresina /Piauí')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660007', '55555555-5555-5555-5555-555555550007', '33333333-3333-3333-3333-333333333333', NULL, 'Pr. Luis Gonzaga', 'Apollo Tobal', 'Kelson', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO payments (id, registration_id, amount_cents, payment_method, notes)
VALUES ('77777777-7777-7777-7777-777777770007', '66666666-6666-6666-6666-666666660007', 20000, 'PIX', 'Inscrição Edição 2026')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660007', '44444444-4444-4444-4444-444444444401', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660007', '44444444-4444-4444-4444-444444444402', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660007', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660007', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [8] Carlos Aurélio Dos Santos Araujo
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550008', 'Carlos Aurélio Dos Santos Araujo', '1977-09-25', 'Masculino', 'Casado', '(86) 98142-9692', 'Qd 27, Casa 21, Setor C, 21 - Mocambinho III - Teresina/Piauí')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660008', '55555555-5555-5555-5555-555555550008', '33333333-3333-3333-3333-333333333333', NULL, 'Pr. Luis Gonzaga', 'Joab Barros', 'Joab Barros', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO payments (id, registration_id, amount_cents, payment_method, notes)
VALUES ('77777777-7777-7777-7777-777777770008', '66666666-6666-6666-6666-666666660008', 20000, 'PIX', 'Inscrição Edição 2026')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660008', '44444444-4444-4444-4444-444444444401', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660008', '44444444-4444-4444-4444-444444444402', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660008', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660008', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [9] Daniele Ferreira Do Nascimento Gomes
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550009', 'Daniele Ferreira Do Nascimento Gomes', '1997-01-06', 'Feminino', 'Solteiro', '(86) 99508-0841', 'Avenida Fotógrafo Guilherme Mule, 4922E - Mocambinho - Teresina/Piauí')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660009', '55555555-5555-5555-5555-555555550009', '33333333-3333-3333-3333-333333333333', NULL, 'Pra. Socorro Paiva', 'Pra. Herlene Monteiro', 'Jaqueline Lustosa', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO payments (id, registration_id, amount_cents, payment_method, notes)
VALUES ('77777777-7777-7777-7777-777777770009', '66666666-6666-6666-6666-666666660009', 20000, 'PIX', 'Inscrição Edição 2026')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660009', '44444444-4444-4444-4444-444444444401', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660009', '44444444-4444-4444-4444-444444444402', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660009', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660009', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [10] Davi Fontenele Medeiros
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550010', 'Davi Fontenele Medeiros', '2013-08-02', 'Masculino', 'Solteiro', '(86) 99523-4649', 'Rua Antônia Miryan Eduardo , 4935 - Condomínio Girassol Residence - Campestre - Teresina /Piauí')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660010', '55555555-5555-5555-5555-555555550010', '33333333-3333-3333-3333-333333333333', NULL, 'Pr. Luis Gonzaga', 'Walcídio Júnior', 'Leonardo', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660010', '44444444-4444-4444-4444-444444444401', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660010', '44444444-4444-4444-4444-444444444402', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660010', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660010', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [11] Denise Rayanne da Silva Moraes
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550011', 'Denise Rayanne da Silva Moraes', '2004-01-01', 'Feminino', 'Solteiro', '(86) 99961-2967', 'Povoado Fazenda Soares')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660011', '55555555-5555-5555-5555-555555550011', '33333333-3333-3333-3333-333333333333', NULL, 'Pra. Socorro Paiva', 'Karol Abreu', 'Gabriela Tobal', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660011', '44444444-4444-4444-4444-444444444401', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660011', '44444444-4444-4444-4444-444444444402', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660011', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660011', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [12] Diego Ramon da Silva Morais
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550012', 'Diego Ramon da Silva Morais', '2001-01-01', 'Masculino', 'Casado', '(86) 99439-9253', 'Povoado Fazenda Soares')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660012', '55555555-5555-5555-5555-555555550012', '33333333-3333-3333-3333-333333333333', NULL, 'Pr. Luis Gonzaga', 'Apollo Tobal', 'Apollo', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO health_records (person_id, has_condition, condition_description, medication_schedule)
VALUES ('55555555-5555-5555-5555-555555550012', true, 'Intolerância a lactose e alergia à dipirona', NULL)
ON CONFLICT (person_id) DO UPDATE SET condition_description = EXCLUDED.condition_description, medication_schedule = EXCLUDED.medication_schedule;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660012', '44444444-4444-4444-4444-444444444401', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660012', '44444444-4444-4444-4444-444444444402', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660012', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660012', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [13] Edmilson Vieira De Sousa Filho
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550013', 'Edmilson Vieira De Sousa Filho', '2000-01-01', 'Masculino', 'Solteiro', '(86) 99811-9942', 'Avenida Campo Maior , 3395 - Nova Brasilia - Teresina /Piauí')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660013', '55555555-5555-5555-5555-555555550013', '33333333-3333-3333-3333-333333333333', NULL, 'Pr. Luis Gonzaga', 'Apollo Tobal', 'Kelson', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO payments (id, registration_id, amount_cents, payment_method, notes)
VALUES ('77777777-7777-7777-7777-777777770013', '66666666-6666-6666-6666-666666660013', 20000, 'PIX', 'Inscrição Edição 2026')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660013', '44444444-4444-4444-4444-444444444401', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660013', '44444444-4444-4444-4444-444444444402', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660013', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660013', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [14] Elcimar
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550014', 'Elcimar', '1980-01-01', 'Masculino', 'Solteiro', '(86) 99999-0000', NULL)
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660014', '55555555-5555-5555-5555-555555550014', '33333333-3333-3333-3333-333333333333', NULL, 'Pr. Luis Gonzaga', 'Raimundo Nonato', 'Raimundo Nonato', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660014', '44444444-4444-4444-4444-444444444401', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660014', '44444444-4444-4444-4444-444444444402', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660014', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660014', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [15] Fernanda Maria De Jesus Silva
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550015', 'Fernanda Maria De Jesus Silva', '1994-06-19', 'Feminino', 'Solteiro', '(86) 99903-6840', 'José Painho, 5436 - Santa Maria - Teresina /Piauí')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660015', '55555555-5555-5555-5555-555555550015', '33333333-3333-3333-3333-333333333333', NULL, 'Pra. Socorro Paiva', 'Bruna Alencar', 'Eryckah Laila', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660015', '44444444-4444-4444-4444-444444444401', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660015', '44444444-4444-4444-4444-444444444402', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660015', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660015', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [16] Francisco Érison Santos Batista
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550016', 'Francisco Érison Santos Batista', '1984-03-31', 'Masculino', 'União Estável', '(86) 99561-0791', 'Rua Moacir Ferreira, 8188 - Mocambinho - Teresina/PI')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660016', '55555555-5555-5555-5555-555555550016', '33333333-3333-3333-3333-333333333333', NULL, 'Pr. Luis Gonzaga', 'Apollo Tobal', 'Apollo', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660016', '44444444-4444-4444-4444-444444444401', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660016', '44444444-4444-4444-4444-444444444402', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660016', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660016', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [17] Franklin Fernandes do Nascimento
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550017', 'Franklin Fernandes do Nascimento', '2013-05-19', 'Masculino', 'Solteiro', '(86) 99477-3861', 'Qd 08, Casa 32, 32 - Nova Teresina - Teresina /Piauí')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660017', '55555555-5555-5555-5555-555555550017', '33333333-3333-3333-3333-333333333333', NULL, 'Pr. Luis Gonzaga', 'Jesiley Alber', 'Júnior Amaro', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO health_records (person_id, has_condition, condition_description, medication_schedule)
VALUES ('55555555-5555-5555-5555-555555550017', true, 'Alérgico a Dipirona', NULL)
ON CONFLICT (person_id) DO UPDATE SET condition_description = EXCLUDED.condition_description, medication_schedule = EXCLUDED.medication_schedule;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660017', '44444444-4444-4444-4444-444444444401', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660017', '44444444-4444-4444-4444-444444444402', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660017', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660017', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [18] Gabriel Ângelo Lira dos Santos Fontenele
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550018', 'Gabriel Ângelo Lira dos Santos Fontenele', '2003-03-11', 'Masculino', 'Casado', '(86) 99545-6811', 'Condomínio Alameda dos Ipês , 6443 - Pedra Mole - Teresina /Piauí')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660018', '55555555-5555-5555-5555-555555550018', '33333333-3333-3333-3333-333333333333', NULL, 'Pr. Luis Gonzaga', 'Apollo Tobal', 'Kelson', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO payments (id, registration_id, amount_cents, payment_method, notes)
VALUES ('77777777-7777-7777-7777-777777770018', '66666666-6666-6666-6666-666666660018', 20000, 'CARTÃO', 'Inscrição Edição 2026')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660018', '44444444-4444-4444-4444-444444444401', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660018', '44444444-4444-4444-4444-444444444402', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660018', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660018', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [19] Gabriele Rodrigues Lima
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550019', 'Gabriele Rodrigues Lima', '2008-12-03', 'Feminino', 'Solteiro', '(86) 98802-9127', 'Avenida fotógrafo Guilherme , 8016 - Casa - Mocambinho - Teresina /Piauí')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660019', '55555555-5555-5555-5555-555555550019', '33333333-3333-3333-3333-333333333333', NULL, 'Pra. Socorro Paiva', 'Pra. Marta Mônica', 'Celina', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO health_records (person_id, has_condition, condition_description, medication_schedule)
VALUES ('55555555-5555-5555-5555-555555550019', true, 'Gastrite', NULL)
ON CONFLICT (person_id) DO UPDATE SET condition_description = EXCLUDED.condition_description, medication_schedule = EXCLUDED.medication_schedule;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660019', '44444444-4444-4444-4444-444444444401', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660019', '44444444-4444-4444-4444-444444444402', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660019', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660019', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [20] Guilherme Sousa Viana
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550020', 'Guilherme Sousa Viana', '2010-05-04', 'Masculino', 'Solteiro', '(86) 99445-6304', 'Rua Porto , 17 - Próximo avenida Maranhão - São Pedro - Teresina /Piauí')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660020', '55555555-5555-5555-5555-555555550020', '33333333-3333-3333-3333-333333333333', NULL, 'Pr. Luis Gonzaga', 'Apollo Tobal', 'Kelson', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO health_records (person_id, has_condition, condition_description, medication_schedule)
VALUES ('55555555-5555-5555-5555-555555550020', true, 'Intolerância à lactose', NULL)
ON CONFLICT (person_id) DO UPDATE SET condition_description = EXCLUDED.condition_description, medication_schedule = EXCLUDED.medication_schedule;
INSERT INTO payments (id, registration_id, amount_cents, payment_method, notes)
VALUES ('77777777-7777-7777-7777-777777770020', '66666666-6666-6666-6666-666666660020', 20000, 'DINHEIRO', 'Inscrição Edição 2026')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660020', '44444444-4444-4444-4444-444444444401', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660020', '44444444-4444-4444-4444-444444444402', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660020', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660020', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [21] Isabele Pereira Santos
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550021', 'Isabele Pereira Santos', '2013-06-09', 'Feminino', 'Solteiro', '(86) 98123-8059', 'Rua 6, 5244 - Vila mocambinho 1 - Teresina /Piauí')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660021', '55555555-5555-5555-5555-555555550021', '33333333-3333-3333-3333-333333333333', NULL, 'Pra. Socorro Paiva', 'Francisca Sousa', 'Francisca Sousa', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660021', '44444444-4444-4444-4444-444444444401', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660021', '44444444-4444-4444-4444-444444444402', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660021', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660021', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [22] Isadora Pereira Santos
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550022', 'Isadora Pereira Santos', '2013-06-09', 'Feminino', 'Solteiro', '(86) 98123-8059', 'Rua 6, 5244 - Vila mocambinho 1 - Teresina /Piauí')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660022', '55555555-5555-5555-5555-555555550022', '33333333-3333-3333-3333-333333333333', NULL, 'Pra. Socorro Paiva', 'Francisca Sousa', 'Francisca Sousa', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660022', '44444444-4444-4444-4444-444444444401', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660022', '44444444-4444-4444-4444-444444444402', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660022', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660022', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [23] Jaílson Igor dos Santos
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550023', 'Jaílson Igor dos Santos', '1998-09-26', 'Masculino', 'Solteiro', '(86) 98815-4704', 'Rua Barras , 4430 - Memorare - Teresina/PI')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660023', '55555555-5555-5555-5555-555555550023', '33333333-3333-3333-3333-333333333333', NULL, 'Pr. Luis Gonzaga', 'Apollo Tobal', 'Kelson', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660023', '44444444-4444-4444-4444-444444444401', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660023', '44444444-4444-4444-4444-444444444402', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660023', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660023', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [24] Joana Darc De Sousa Pereira
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550024', 'Joana Darc De Sousa Pereira', '1964-11-24', 'Feminino', 'Divorciado', '(86) 99806-1236', 'Av Campo Maior , 3395 - Nova Brasília - Teresina /Piauí')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660024', '55555555-5555-5555-5555-555555550024', '33333333-3333-3333-3333-333333333333', NULL, 'Pra. Socorro Paiva', 'Carol Barros', 'Vera Abreu', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO payments (id, registration_id, amount_cents, payment_method, notes)
VALUES ('77777777-7777-7777-7777-777777770024', '66666666-6666-6666-6666-666666660024', 20000, 'DINHEIRO', 'Inscrição Edição 2026')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660024', '44444444-4444-4444-4444-444444444401', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660024', '44444444-4444-4444-4444-444444444402', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660024', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660024', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [25] João Paulo Damasceno Silva
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550025', 'João Paulo Damasceno Silva', '2001-06-24', 'Masculino', 'Casado', '(86) 99405-1546', 'Rua 08, 1839 - Monte Alegre - Teresina/PI')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660025', '55555555-5555-5555-5555-555555550025', '33333333-3333-3333-3333-333333333333', NULL, 'Pr. Luis Gonzaga', 'Ademir Pereira', 'Ademir Pereira', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO payments (id, registration_id, amount_cents, payment_method, notes)
VALUES ('77777777-7777-7777-7777-777777770025', '66666666-6666-6666-6666-666666660025', 20000, 'PIX', 'Inscrição Edição 2026')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660025', '44444444-4444-4444-4444-444444444401', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660025', '44444444-4444-4444-4444-444444444402', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660025', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660025', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [26] Jucilene Da Penha Silva
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550026', 'Jucilene Da Penha Silva', '1989-08-14', 'Feminino', 'Solteiro', '(86) 99471-4317', 'Rua Mário Augusto freitas , 921 - Poty velho - Teresina/PI')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660026', '55555555-5555-5555-5555-555555550026', '33333333-3333-3333-3333-333333333333', NULL, 'Pra. Socorro Paiva', 'Carmela Lustosa', 'Fernanda', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO payments (id, registration_id, amount_cents, payment_method, notes)
VALUES ('77777777-7777-7777-7777-777777770026', '66666666-6666-6666-6666-666666660026', 20000, 'PIX', 'Inscrição Edição 2026')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660026', '44444444-4444-4444-4444-444444444401', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660026', '44444444-4444-4444-4444-444444444402', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660026', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660026', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [27] Juliana Rodrigues Cunha
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550027', 'Juliana Rodrigues Cunha', '2000-12-10', 'Feminino', 'Solteiro', '(86) 98848-1297', 'Rua Guaraci, 5885 - São Francisco - Teresina /Piauí')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660027', '55555555-5555-5555-5555-555555550027', '33333333-3333-3333-3333-333333333333', NULL, 'Pra. Socorro Paiva', 'Pra. Marta Mônica', 'Celina', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660027', '44444444-4444-4444-4444-444444444401', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660027', '44444444-4444-4444-4444-444444444402', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660027', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660027', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [28] Karina Calaça Da Silva
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550028', 'Karina Calaça Da Silva', '2006-05-22', 'Feminino', 'Solteiro', '(86) 99409-6033', 'Setor C, Q25 C16 - Mocambinho - Teresina /Piauí')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660028', '55555555-5555-5555-5555-555555550028', '33333333-3333-3333-3333-333333333333', NULL, 'Pra. Socorro Paiva', 'Otacília Graziela', 'Yndira Moura', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO payments (id, registration_id, amount_cents, payment_method, notes)
VALUES ('77777777-7777-7777-7777-777777770028', '66666666-6666-6666-6666-666666660028', 20000, 'PIX', 'Inscrição Edição 2026')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660028', '44444444-4444-4444-4444-444444444401', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660028', '44444444-4444-4444-4444-444444444402', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660028', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660028', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [29] Kassia Fernanda Da Silva Piauilino
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550029', 'Kassia Fernanda Da Silva Piauilino', '1995-10-03', 'Feminino', 'Solteiro', '(86) 98839-2927', 'Rua 3, 5255 - Ap 107 - Mocambinho - Teresina /Piauí')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660029', '55555555-5555-5555-5555-555555550029', '33333333-3333-3333-3333-333333333333', NULL, 'Pra. Socorro Paiva', 'Carol Barros', 'Maurina', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660029', '44444444-4444-4444-4444-444444444401', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660029', '44444444-4444-4444-4444-444444444402', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660029', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660029', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [30] Kawan Silva Santos
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550030', 'Kawan Silva Santos', '2010-10-01', 'Masculino', 'Solteiro', '(86) 99456-0594', 'Rua Professor Rogerio Matos, 5206 - Hospital do Mocambinho - Vila Mocambinho 1 - Teresina/Pi')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660030', '55555555-5555-5555-5555-555555550030', '33333333-3333-3333-3333-333333333333', NULL, 'Pr. Luis Gonzaga', 'Jesiley Alber', 'Elias', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO payments (id, registration_id, amount_cents, payment_method, notes)
VALUES ('77777777-7777-7777-7777-777777770030', '66666666-6666-6666-6666-666666660030', 20000, 'PIX', 'Inscrição Edição 2026')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660030', '44444444-4444-4444-4444-444444444401', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660030', '44444444-4444-4444-4444-444444444402', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660030', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660030', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [31] Lara Sofia Fontenele Sousa
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550031', 'Lara Sofia Fontenele Sousa', '2012-06-09', 'Feminino', 'Solteiro', '(86) 99523-4649', 'Quadra 21 casa 24 setor b, 24 - Casa - Mocambinho - Teresina /Piauí')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660031', '55555555-5555-5555-5555-555555550031', '33333333-3333-3333-3333-333333333333', NULL, 'Pra. Socorro Paiva', 'Pra. Herlene Monteiro', 'Maria Teresa', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660031', '44444444-4444-4444-4444-444444444401', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660031', '44444444-4444-4444-4444-444444444402', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660031', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660031', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [32] Luiza de Sá Matos
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550032', 'Luiza de Sá Matos', '1970-09-23', 'Feminino', 'Viúvo', '(86) 99995-0292', 'Rua Getúlio Vargas , 6014 - São Francisco - Teresina/Piauí')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660032', '55555555-5555-5555-5555-555555550032', '33333333-3333-3333-3333-333333333333', NULL, 'Pra. Socorro Paiva', 'Francinete Pereira', 'Francinete Pereira', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO payments (id, registration_id, amount_cents, payment_method, notes)
VALUES ('77777777-7777-7777-7777-777777770032', '66666666-6666-6666-6666-666666660032', 20000, 'CARTÃO', 'Inscrição Edição 2026')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660032', '44444444-4444-4444-4444-444444444401', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660032', '44444444-4444-4444-4444-444444444402', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660032', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660032', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [33] Márcia Silva do Nascimento
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550033', 'Márcia Silva do Nascimento', '1969-11-23', 'Feminino', 'Solteiro', '(86) 98163-1969', 'Mocambinho III Quadra 33 Setor C, 14 - Mocambinho - Teresina/Piauí')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660033', '55555555-5555-5555-5555-555555550033', '33333333-3333-3333-3333-333333333333', NULL, 'Pra. Socorro Paiva', 'Pra. Marta Mônica', 'Ivone', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO health_records (person_id, has_condition, condition_description, medication_schedule)
VALUES ('55555555-5555-5555-5555-555555550033', true, 'Diabetes, Hipertensão', 'Depois do Café da manhã e do jantar')
ON CONFLICT (person_id) DO UPDATE SET condition_description = EXCLUDED.condition_description, medication_schedule = EXCLUDED.medication_schedule;
INSERT INTO payments (id, registration_id, amount_cents, payment_method, notes)
VALUES ('77777777-7777-7777-7777-777777770033', '66666666-6666-6666-6666-666666660033', 20000, 'CARTÃO', 'Inscrição Edição 2026')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660033', '44444444-4444-4444-4444-444444444401', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660033', '44444444-4444-4444-4444-444444444402', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660033', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660033', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [34] Maria Beatriz Lopes Lourenço
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550034', 'Maria Beatriz Lopes Lourenço', '2006-01-01', 'Feminino', 'Solteiro', '(86) 99472-9586', 'Povoado Fazenda Soares')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660034', '55555555-5555-5555-5555-555555550034', '33333333-3333-3333-3333-333333333333', NULL, 'Pra. Socorro Paiva', 'Karol Abreu', 'Gabriela Tobal', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO health_records (person_id, has_condition, condition_description, medication_schedule)
VALUES ('55555555-5555-5555-5555-555555550034', true, 'Alergia a Buscopan, produtos de limpeza, gasolina, cimento', NULL)
ON CONFLICT (person_id) DO UPDATE SET condition_description = EXCLUDED.condition_description, medication_schedule = EXCLUDED.medication_schedule;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660034', '44444444-4444-4444-4444-444444444401', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660034', '44444444-4444-4444-4444-444444444402', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660034', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660034', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [35] Maria Cecília Sousa Silva
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550035', 'Maria Cecília Sousa Silva', '2000-10-15', 'Feminino', 'Solteiro', '(86) 99438-0325', 'Rua Santa Cruz, 5180, Mocambinho 1')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660035', '55555555-5555-5555-5555-555555550035', '33333333-3333-3333-3333-333333333333', NULL, 'Pra. Socorro Paiva', 'Francisca Sousa', 'Claudete', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO payments (id, registration_id, amount_cents, payment_method, notes)
VALUES ('77777777-7777-7777-7777-777777770035', '66666666-6666-6666-6666-666666660035', 20000, 'CARTÃO', 'Inscrição Edição 2026')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660035', '44444444-4444-4444-4444-444444444401', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660035', '44444444-4444-4444-4444-444444444402', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660035', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660035', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [36] Maria de Jesus
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550036', 'Maria de Jesus', '2000-10-15', 'Feminino', 'Solteiro', '(86) 98839-9316', NULL)
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660036', '55555555-5555-5555-5555-555555550036', '33333333-3333-3333-3333-333333333333', NULL, 'Pra. Socorro Paiva', 'Pra. Marta Mônica', 'Dulce', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660036', '44444444-4444-4444-4444-444444444401', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660036', '44444444-4444-4444-4444-444444444402', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660036', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660036', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [37] Maria de Lurdes Rodrigues Ferreira
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550037', 'Maria de Lurdes Rodrigues Ferreira', '1955-10-05', 'Feminino', 'Solteiro', '(86) 99998-2311', 'Rua Vereador Emílio Mate , 2499 - Beira Rio - Teresina/Piauí')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660037', '55555555-5555-5555-5555-555555550037', '33333333-3333-3333-3333-333333333333', NULL, 'Pra. Socorro Paiva', 'Pra. Herlene Monteiro', 'Jaqueline Lustosa', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO health_records (person_id, has_condition, condition_description, medication_schedule)
VALUES ('55555555-5555-5555-5555-555555550037', true, 'Diabetes', 'Manhã em Jejum, meio dia e à noite')
ON CONFLICT (person_id) DO UPDATE SET condition_description = EXCLUDED.condition_description, medication_schedule = EXCLUDED.medication_schedule;
INSERT INTO payments (id, registration_id, amount_cents, payment_method, notes)
VALUES ('77777777-7777-7777-7777-777777770037', '66666666-6666-6666-6666-666666660037', 20000, 'PIX', 'Inscrição Edição 2026')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660037', '44444444-4444-4444-4444-444444444401', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660037', '44444444-4444-4444-4444-444444444402', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660037', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660037', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [38] Maria do Socorro Rodrigues
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550038', 'Maria do Socorro Rodrigues', '2002-11-18', 'Feminino', 'Solteiro', '(86) 98858-2683', 'Rua Ceará , 1819 - Vila operária - Teresina /Piauí')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660038', '55555555-5555-5555-5555-555555550038', '33333333-3333-3333-3333-333333333333', NULL, 'Pra. Socorro Paiva', 'Karol Abreu', 'Karol Abreu', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO health_records (person_id, has_condition, condition_description, medication_schedule)
VALUES ('55555555-5555-5555-5555-555555550038', true, 'Depressão, ansiedade', 'Noite')
ON CONFLICT (person_id) DO UPDATE SET condition_description = EXCLUDED.condition_description, medication_schedule = EXCLUDED.medication_schedule;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660038', '44444444-4444-4444-4444-444444444401', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660038', '44444444-4444-4444-4444-444444444402', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660038', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660038', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [39] Maria Eduarda Borges Freitas
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550039', 'Maria Eduarda Borges Freitas', '2005-05-07', 'Feminino', 'Solteiro', '(86) 98874-0400', 'Rua 19, Bairro São Benedito - Teresina/Piauí')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660039', '55555555-5555-5555-5555-555555550039', '33333333-3333-3333-3333-333333333333', NULL, 'Pra. Socorro Paiva', 'Pra. Herlene Monteiro', 'Jaqueline Lustosa', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660039', '44444444-4444-4444-4444-444444444401', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660039', '44444444-4444-4444-4444-444444444402', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660039', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660039', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [40] Maria Vitória Fontenele Sousa
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550040', 'Maria Vitória Fontenele Sousa', '2015-06-09', 'Feminino', 'Solteiro', '(86) 99523-4649', 'Quadra 21 setor B , Casa 24 - Mocambinho 1 - Mocambinho 1 - Teresina /Piauí')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660040', '55555555-5555-5555-5555-555555550040', '33333333-3333-3333-3333-333333333333', NULL, 'Pra. Socorro Paiva', 'Pra. Herlene Monteiro', 'Maria Teresa', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660040', '44444444-4444-4444-4444-444444444401', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660040', '44444444-4444-4444-4444-444444444402', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660040', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660040', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [41] Milena Carvalho De Andrade
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550041', 'Milena Carvalho De Andrade', '1999-01-15', 'Feminino', 'Solteiro', '(86) 99448-7581', '64010070 Mocambinho setor A , Casa 27 QD 19 - Teresina - Teresina /Piauí')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660041', '55555555-5555-5555-5555-555555550041', '33333333-3333-3333-3333-333333333333', NULL, 'Pra. Socorro Paiva', 'Carmela Lustosa', 'Fernanda', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO payments (id, registration_id, amount_cents, payment_method, notes)
VALUES ('77777777-7777-7777-7777-777777770041', '66666666-6666-6666-6666-666666660041', 20000, 'PIX', 'Inscrição Edição 2026')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660041', '44444444-4444-4444-4444-444444444401', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660041', '44444444-4444-4444-4444-444444444402', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660041', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660041', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [42] Rafael Da Silva Queiroz
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550042', 'Rafael Da Silva Queiroz', '1996-12-11', 'Masculino', 'Solteiro', '(86) 99846-8633', 'Q 6 c 5 setor A, 5 - Mocambinho II - Teresina/Piauí')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660042', '55555555-5555-5555-5555-555555550042', '33333333-3333-3333-3333-333333333333', NULL, 'Pr. Luis Gonzaga', 'Agustinho Rodrigues', 'Agustinho Rodrigues', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660042', '44444444-4444-4444-4444-444444444401', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660042', '44444444-4444-4444-4444-444444444402', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660042', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660042', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [43] Rafael Damasceno Ribeiro
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550043', 'Rafael Damasceno Ribeiro', '1998-12-24', 'Masculino', 'Viúvo', '(86) 99912-2270', 'Qd 16 Casa 36 Leonel Brizola , 36 - Monte Verde - Teresina/PI')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660043', '55555555-5555-5555-5555-555555550043', '33333333-3333-3333-3333-333333333333', NULL, 'Pr. Luis Gonzaga', 'Ademir Pereira', 'Ademir Pereira', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO payments (id, registration_id, amount_cents, payment_method, notes)
VALUES ('77777777-7777-7777-7777-777777770043', '66666666-6666-6666-6666-666666660043', 20000, 'PIX', 'Inscrição Edição 2026')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660043', '44444444-4444-4444-4444-444444444401', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660043', '44444444-4444-4444-4444-444444444402', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660043', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660043', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [44] Reynan Keven Da Silva
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550044', 'Reynan Keven Da Silva', '2004-01-01', 'Masculino', 'Solteiro', '(86) 99949-2754', 'Avenida campo maior , 3301 - Nova Brasília - Teresina /Piauí')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660044', '55555555-5555-5555-5555-555555550044', '33333333-3333-3333-3333-333333333333', NULL, 'Pr. Luis Gonzaga', 'Apollo Tobal', 'Kelson', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO payments (id, registration_id, amount_cents, payment_method, notes)
VALUES ('77777777-7777-7777-7777-777777770044', '66666666-6666-6666-6666-666666660044', 20000, 'PIX', 'Inscrição Edição 2026')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660044', '44444444-4444-4444-4444-444444444401', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660044', '44444444-4444-4444-4444-444444444402', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660044', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660044', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [45] Richardy Freitas Santos
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550045', 'Richardy Freitas Santos', '2000-01-19', 'Masculino', 'Solteiro', '(86) 99847-7508', 'Rua José Omati, Q I Casa 04 - Matadouro - Teresina/Pi')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660045', '55555555-5555-5555-5555-555555550045', '33333333-3333-3333-3333-333333333333', NULL, 'Pr. Luis Gonzaga', 'Apollo Tobal', 'Apollo', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO payments (id, registration_id, amount_cents, payment_method, notes)
VALUES ('77777777-7777-7777-7777-777777770045', '66666666-6666-6666-6666-666666660045', 20000, 'PIX', 'Inscrição Edição 2026')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660045', '44444444-4444-4444-4444-444444444401', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660045', '44444444-4444-4444-4444-444444444402', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660045', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660045', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [46] Riquelmy Lucas Fernandes Brandão
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550046', 'Riquelmy Lucas Fernandes Brandão', '2013-01-01', 'Masculino', 'Solteiro', '(86) 99538-6161', 'Residencial Sigefredo Pacheco II, Quadra A2, Casa 02, Vale do Gavião')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660046', '55555555-5555-5555-5555-555555550046', '33333333-3333-3333-3333-333333333333', NULL, 'Pr. Luis Gonzaga', 'Joab Barros', 'Joab Barros', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO payments (id, registration_id, amount_cents, payment_method, notes)
VALUES ('77777777-7777-7777-7777-777777770046', '66666666-6666-6666-6666-666666660046', 20000, 'PIX', 'Inscrição Edição 2026')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660046', '44444444-4444-4444-4444-444444444401', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660046', '44444444-4444-4444-4444-444444444402', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660046', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660046', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [47] Rômulo Leite Brito
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550047', 'Rômulo Leite Brito', '1985-11-03', 'Masculino', 'Divorciado', '(86) 98888-0011', 'Rua Oeiras 2319, Vermelha, Teresina, Piauí')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660047', '55555555-5555-5555-5555-555555550047', '33333333-3333-3333-3333-333333333333', NULL, 'Pr. Luis Gonzaga', 'Agustinho Rodrigues', 'Agustinho Rodrigues', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO health_records (person_id, has_condition, condition_description, medication_schedule)
VALUES ('55555555-5555-5555-5555-555555550047', true, 'Recuperação de AVC, Diabético', 'Manhã, Almoço e Janta')
ON CONFLICT (person_id) DO UPDATE SET condition_description = EXCLUDED.condition_description, medication_schedule = EXCLUDED.medication_schedule;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660047', '44444444-4444-4444-4444-444444444401', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660047', '44444444-4444-4444-4444-444444444402', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660047', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660047', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [48] Simone Barros
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550048', 'Simone Barros', '2000-01-01', 'Feminino', 'Solteiro', '(86) 99999-0000', NULL)
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660048', '55555555-5555-5555-5555-555555550048', '33333333-3333-3333-3333-333333333333', NULL, 'Pra. Socorro Paiva', 'Carol Barros', 'Antonia Maria', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO payments (id, registration_id, amount_cents, payment_method, notes)
VALUES ('77777777-7777-7777-7777-777777770048', '66666666-6666-6666-6666-666666660048', 20000, 'PIX', 'Inscrição Edição 2026')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660048', '44444444-4444-4444-4444-444444444401', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660048', '44444444-4444-4444-4444-444444444402', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660048', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660048', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [49] Simone Rodrigues
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550049', 'Simone Rodrigues', '2000-01-01', 'Feminino', 'Solteiro', '(86) 99999-0000', NULL)
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660049', '55555555-5555-5555-5555-555555550049', '33333333-3333-3333-3333-333333333333', NULL, 'Pra. Socorro Paiva', 'Francisca Sousa', 'Claudete', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO payments (id, registration_id, amount_cents, payment_method, notes)
VALUES ('77777777-7777-7777-7777-777777770049', '66666666-6666-6666-6666-666666660049', 20000, 'CARTÃO', 'Inscrição Edição 2026')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660049', '44444444-4444-4444-4444-444444444401', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660049', '44444444-4444-4444-4444-444444444402', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660049', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660049', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [50] Talita Manoela de Sousa Silva
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550050', 'Talita Manoela de Sousa Silva', '2001-01-01', 'Feminino', 'Casado', '(86) 99845-1712', 'Rua Dourado 3714')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660050', '55555555-5555-5555-5555-555555550050', '33333333-3333-3333-3333-333333333333', 'GG', 'Pra. Socorro Paiva', 'Carol Barros', 'Vera Abreu', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO payments (id, registration_id, amount_cents, payment_method, notes)
VALUES ('77777777-7777-7777-7777-777777770050', '66666666-6666-6666-6666-666666660050', 20000, 'PIX', 'Inscrição Edição 2026')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660050', '44444444-4444-4444-4444-444444444401', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660050', '44444444-4444-4444-4444-444444444402', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660050', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660050', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [51] Thialyson Esteves Rodrigues Tôrres
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550051', 'Thialyson Esteves Rodrigues Tôrres', '1996-10-10', 'Masculino', 'Solteiro', '(86) 99928-6438', 'Rua Barreto Cordeiro, 107 - Proximo ao Lar do Frango - Mocambinho - Teresina/Piauí')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660051', '55555555-5555-5555-5555-555555550051', '33333333-3333-3333-3333-333333333333', NULL, 'Pr. Luis Gonzaga', 'Agustinho Rodrigues', 'Agustinho Rodrigues', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660051', '44444444-4444-4444-4444-444444444401', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660051', '44444444-4444-4444-4444-444444444402', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660051', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660051', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [52] Vera Lúcia Alves de Sousa
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550052', 'Vera Lúcia Alves de Sousa', '1983-01-01', 'Feminino', 'Solteiro', '(86) 98903-3061', 'Av. Prefeito Freitas Neto 1395 - Mocambinho')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660052', '55555555-5555-5555-5555-555555550052', '33333333-3333-3333-3333-333333333333', NULL, 'Pra. Socorro Paiva', 'Francisca Silva', 'Claudete', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO payments (id, registration_id, amount_cents, payment_method, notes)
VALUES ('77777777-7777-7777-7777-777777770052', '66666666-6666-6666-6666-666666660052', 20000, 'PIX', 'Inscrição Edição 2026')
ON CONFLICT (id) DO NOTHING;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660052', '44444444-4444-4444-4444-444444444401', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660052', '44444444-4444-4444-4444-444444444402', true)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660052', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660052', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;

-- [53] Walisson Henrique da Silva Sousa
INSERT INTO people (id, full_name, birth_date, gender, marital_status, phone, address)
VALUES ('55555555-5555-5555-5555-555555550053', 'Walisson Henrique da Silva Sousa', '2000-03-22', 'Masculino', 'Solteiro', '(86) 98813-7659', NULL)
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, address = EXCLUDED.address;
INSERT INTO registrations (id, person_id, edition_id, shirt_size, pastor_name, g12_leader, cell_leader, status)
VALUES ('66666666-6666-6666-6666-666666660053', '55555555-5555-5555-5555-555555550053', '33333333-3333-3333-3333-333333333333', NULL, 'Pr. Luis Gonzaga', 'Apollo Tobal', 'Kelson', 'confirmed')
ON CONFLICT (id) DO UPDATE SET shirt_size = EXCLUDED.shirt_size, pastor_name = EXCLUDED.pastor_name, g12_leader = EXCLUDED.g12_leader, cell_leader = EXCLUDED.cell_leader;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660053', '44444444-4444-4444-4444-444444444401', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660053', '44444444-4444-4444-4444-444444444402', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660053', '44444444-4444-4444-4444-444444444403', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
INSERT INTO attendances (registration_id, lesson_id, present)
VALUES ('66666666-6666-6666-6666-666666660053', '44444444-4444-4444-4444-444444444404', false)
ON CONFLICT (registration_id, lesson_id) DO UPDATE SET present = EXCLUDED.present;
