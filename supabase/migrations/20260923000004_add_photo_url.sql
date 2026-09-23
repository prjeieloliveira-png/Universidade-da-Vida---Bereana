-- ============================================================================
-- MIGRAÇÃO 4: Adicionar foto de perfil aos participantes
-- Não destrutiva: ADD COLUMN IF NOT EXISTS + configuração do Storage
-- ============================================================================

-- 1. Adiciona coluna photo_url na tabela people
ALTER TABLE people
    ADD COLUMN IF NOT EXISTS photo_url text;

-- 2. Cria bucket student-photos no Supabase Storage (se ainda não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'student-photos',
    'student-photos',
    false,  -- acesso controlado por políticas RLS
    5242880, -- 5 MB por arquivo
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO NOTHING;

-- 3. Políticas RLS do Storage

-- Leitura: qualquer usuário autenticado pode ver as fotos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid
        WHERE p.polname = 'student_photos_select'
          AND c.relname = 'objects'
          AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'storage')
    ) THEN
        CREATE POLICY "student_photos_select"
        ON storage.objects FOR SELECT TO authenticated
        USING (bucket_id = 'student-photos');
    END IF;
END $$;

-- Upload: apenas coordenação e secretaria podem fazer upload
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid
        WHERE p.polname = 'student_photos_insert'
          AND c.relname = 'objects'
          AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'storage')
    ) THEN
        CREATE POLICY "student_photos_insert"
        ON storage.objects FOR INSERT TO authenticated
        WITH CHECK (
            bucket_id = 'student-photos'
            AND is_coord_or_sec()
        );
    END IF;
END $$;

-- Atualizar / substituir: apenas coordenação e secretaria
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid
        WHERE p.polname = 'student_photos_update'
          AND c.relname = 'objects'
          AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'storage')
    ) THEN
        CREATE POLICY "student_photos_update"
        ON storage.objects FOR UPDATE TO authenticated
        USING (
            bucket_id = 'student-photos'
            AND is_coord_or_sec()
        );
    END IF;
END $$;

-- Deletar: apenas coordenação e secretaria
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid
        WHERE p.polname = 'student_photos_delete'
          AND c.relname = 'objects'
          AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'storage')
    ) THEN
        CREATE POLICY "student_photos_delete"
        ON storage.objects FOR DELETE TO authenticated
        USING (
            bucket_id = 'student-photos'
            AND is_coord_or_sec()
        );
    END IF;
END $$;
