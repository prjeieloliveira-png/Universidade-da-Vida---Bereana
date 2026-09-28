import { describe, expect, it } from 'vitest';
import { sortByName } from './sortByName';

describe('sortByName', () => {
  it('ordena por nome ignorando acentos e maiúsculas (pt-BR)', () => {
    const items = [{ name: 'Bruno' }, { name: 'ana' }, { name: 'Álvaro' }, { name: 'ávila' }];
    expect(sortByName(items, (i) => i.name).map((i) => i.name)).toEqual([
      'Álvaro',
      'ana',
      'ávila',
      'Bruno',
    ]);
  });

  it('não modifica o array original', () => {
    const items = [{ name: 'Zeca' }, { name: 'Ana' }];
    const sorted = sortByName(items, (i) => i.name);
    expect(items[0]?.name).toBe('Zeca');
    expect(sorted[0]?.name).toBe('Ana');
  });
});
