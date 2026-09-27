export const STUDENT_PHOTOS_BUCKET = 'student-photos';

const PUBLIC_URL_MARKER = `/storage/v1/object/public/${STUDENT_PHOTOS_BUCKET}/`;

/**
 * Converte o valor salvo em `people.photo_url` no caminho do objeto no bucket.
 * Aceita tanto o caminho puro (formato atual, ex.: `<personId>/photo.jpeg`)
 * quanto URLs públicas legadas, que não funcionam porque o bucket é privado.
 * Retorna `null` quando não há foto ou quando o valor não pertence ao bucket.
 */
export function toStudentPhotoPath(value?: string | null): string | null {
  if (!value) return null;

  const markerIndex = value.indexOf(PUBLIC_URL_MARKER);
  if (markerIndex >= 0) {
    const path = value.slice(markerIndex + PUBLIC_URL_MARKER.length).split('?')[0];
    return path ? decodeURIComponent(path) : null;
  }

  if (/^(https?:|blob:|data:)/i.test(value)) return null;
  return value;
}

/**
 * Caminho fixo onde guardamos a foto original (antes de qualquer recorte),
 * para permitir reenquadrar sempre a partir da imagem cheia — nunca a partir
 * de um recorte anterior, que já perdeu pixels fora da área escolhida.
 */
export function toStudentOriginalPhotoPath(personId: string): string {
  return `${personId}/original`;
}
