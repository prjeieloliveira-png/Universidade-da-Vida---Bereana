import { describe, expect, it } from 'vitest';
import { toStudentPhotoPath } from './studentPhoto';

describe('toStudentPhotoPath', () => {
  it('retorna null quando não há foto', () => {
    expect(toStudentPhotoPath(undefined)).toBeNull();
    expect(toStudentPhotoPath('')).toBeNull();
  });

  it('mantém caminhos puros do bucket', () => {
    expect(toStudentPhotoPath('abc-123/photo.jpeg')).toBe('abc-123/photo.jpeg');
  });

  it('extrai o caminho de URLs públicas legadas', () => {
    expect(
      toStudentPhotoPath(
        'https://xyz.supabase.co/storage/v1/object/public/student-photos/abc-123/photo.jpeg?t=1'
      )
    ).toBe('abc-123/photo.jpeg');
  });

  it('ignora URLs que não pertencem ao bucket', () => {
    expect(toStudentPhotoPath('https://example.com/foto.png')).toBeNull();
    expect(toStudentPhotoPath('blob:http://localhost/123')).toBeNull();
  });
});
