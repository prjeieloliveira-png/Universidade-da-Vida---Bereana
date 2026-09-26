import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import { STUDENT_PHOTOS_BUCKET, toStudentPhotoPath } from '@/shared/utils/studentPhoto';

const SIGNED_URL_TTL_SECONDS = 60 * 60;

export const studentPhotoQueryKey = (path: string) => ['student-photo', path] as const;

/**
 * O bucket `student-photos` é privado (fotos de pessoas), então a exibição
 * usa URLs assinadas com validade de 1h, renovadas antes de expirar.
 */
export function useStudentPhotoUrl(photoUrl?: string | null): string | undefined {
  const path = toStudentPhotoPath(photoUrl);

  const { data } = useQuery({
    queryKey: studentPhotoQueryKey(path ?? ''),
    queryFn: async () => {
      const { data: signed, error } = await supabase.storage
        .from(STUDENT_PHOTOS_BUCKET)
        .createSignedUrl(path ?? '', SIGNED_URL_TTL_SECONDS);

      if (error) throw error;
      return signed.signedUrl;
    },
    enabled: Boolean(path),
    staleTime: (SIGNED_URL_TTL_SECONDS - 10 * 60) * 1000,
    gcTime: SIGNED_URL_TTL_SECONDS * 1000,
    retry: 1,
  });

  return data;
}
