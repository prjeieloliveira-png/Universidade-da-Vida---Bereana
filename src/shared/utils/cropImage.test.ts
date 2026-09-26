import { describe, expect, it } from 'vitest';
import { getOutputSize, getRotatedSize } from './cropImage';

describe('getRotatedSize', () => {
  it('mantém o tamanho sem rotação ou com 180°', () => {
    expect(getRotatedSize(400, 300, 0)).toEqual({ width: 400, height: 300 });
    expect(getRotatedSize(400, 300, 180)).toEqual({ width: 400, height: 300 });
  });

  it('inverte largura e altura com 90° e 270°', () => {
    expect(getRotatedSize(400, 300, 90)).toEqual({ width: 300, height: 400 });
    expect(getRotatedSize(400, 300, 270)).toEqual({ width: 300, height: 400 });
  });
});

describe('getOutputSize', () => {
  it('reduz recortes maiores que a largura máxima mantendo a proporção', () => {
    expect(getOutputSize({ width: 1500, height: 2000 }, 600)).toEqual({
      width: 600,
      height: 800,
    });
  });

  it('não amplia recortes menores que a largura máxima', () => {
    expect(getOutputSize({ width: 300, height: 400 }, 600)).toEqual({
      width: 300,
      height: 400,
    });
  });
});
