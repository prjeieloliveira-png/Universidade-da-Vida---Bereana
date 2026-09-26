export interface PixelArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Size {
  width: number;
  height: number;
}

/** Proporção padrão das fotos de pessoas: retrato 3×4 (ficha impressa). */
export const PERSON_PHOTO_ASPECT = 3 / 4;

const DEFAULT_MAX_WIDTH = 600;
const DEFAULT_JPEG_QUALITY = 0.85;

/** Tamanho da caixa que contém a imagem após girá-la `rotationDeg` graus. */
export function getRotatedSize(width: number, height: number, rotationDeg: number): Size {
  const rad = (rotationDeg * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  return {
    width: Math.round(cos * width + sin * height),
    height: Math.round(sin * width + cos * height),
  };
}

/** Reduz o recorte para no máximo `maxWidth` de largura, sem ampliar. */
export function getOutputSize(crop: Size, maxWidth = DEFAULT_MAX_WIDTH): Size {
  const scale = Math.min(1, maxWidth / crop.width);
  return {
    width: Math.max(1, Math.round(crop.width * scale)),
    height: Math.max(1, Math.round(crop.height * scale)),
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    // Necessário para recortar fotos já salvas (URL assinada do Storage)
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Não foi possível abrir a imagem.'));
    image.src = src;
  });
}

function createContext(size: Size): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas indisponível neste navegador.');
  return [canvas, ctx];
}

/**
 * Gera um JPEG com a área recortada. `crop` vem em pixels da imagem já
 * girada (formato do `croppedAreaPixels` do react-easy-crop).
 */
export async function cropImageToJpeg(
  src: string,
  crop: PixelArea,
  rotationDeg = 0,
  maxWidth = DEFAULT_MAX_WIDTH
): Promise<Blob> {
  const image = await loadImage(src);
  const rotated = getRotatedSize(image.naturalWidth, image.naturalHeight, rotationDeg);

  const [rotatedCanvas, rotatedCtx] = createContext(rotated);
  rotatedCtx.translate(rotated.width / 2, rotated.height / 2);
  rotatedCtx.rotate((rotationDeg * Math.PI) / 180);
  rotatedCtx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);

  const output = getOutputSize(crop, maxWidth);
  const [outputCanvas, outputCtx] = createContext(output);
  outputCtx.imageSmoothingQuality = 'high';
  outputCtx.drawImage(
    rotatedCanvas,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    output.width,
    output.height
  );

  return new Promise((resolve, reject) => {
    outputCanvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Falha ao gerar a imagem.'))),
      'image/jpeg',
      DEFAULT_JPEG_QUALITY
    );
  });
}
