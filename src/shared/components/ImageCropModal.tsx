import { useState } from 'react';
import { createPortal } from 'react-dom';
import Cropper, { type Area } from 'react-easy-crop';
import { Check, Loader2, RotateCw, X, ZoomIn, ZoomOut } from 'lucide-react';
import { PERSON_PHOTO_ASPECT, cropImageToJpeg } from '@/shared/utils/cropImage';

interface ImageCropModalProps {
  imageSrc: string;
  aspect?: number;
  title?: string;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

/**
 * Modal reutilizável para enquadrar uma foto antes do upload.
 * A guia oval indica onde centralizar o rosto; o resultado é um JPEG
 * retangular na proporção `aspect`.
 */
export function ImageCropModal({
  imageSrc,
  aspect = PERSON_PHOTO_ASPECT,
  title = 'Enquadrar foto',
  onCancel,
  onConfirm,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleConfirm = async () => {
    if (!croppedArea) return;
    setIsProcessing(true);
    setErrorMsg('');
    try {
      const blob = await cropImageToJpeg(imageSrc, croppedArea, rotation);
      onConfirm(blob);
    } catch (err) {
      console.error('Erro ao recortar a foto:', err);
      setErrorMsg('Não foi possível processar esta foto. Tente outra imagem.');
      setIsProcessing(false);
    }
  };

  const changeZoom = (delta: number) =>
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z + delta)));

  const iconButton =
    'w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40';

  return createPortal(
    <div
      className="fixed inset-0 z-[80] bg-slate-950 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <header className="flex items-center justify-between px-4 py-3 text-white">
        <button type="button" onClick={onCancel} className={iconButton} aria-label="Cancelar">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-sm font-bold">{title}</h2>
        <span className="w-10" aria-hidden="true" />
      </header>

      <div className="relative flex-1 min-h-0">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspect}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_area, areaPixels) => setCroppedArea(areaPixels)}
          onMediaLoaded={() => setErrorMsg('')}
        />
      </div>

      <footer className="px-4 pt-3 pb-5 flex flex-col gap-3 bg-slate-950">
        <p className="text-center text-[11px] text-slate-400 font-medium">
          Arraste e use o zoom para centralizar o rosto dentro da guia
        </p>

        <div className="flex items-center gap-3">
          <button type="button" onClick={() => changeZoom(-0.25)} className={iconButton} aria-label="Diminuir zoom">
            <ZoomOut className="w-4 h-4" />
          </button>
          <input
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-white cursor-pointer"
            aria-label="Zoom"
          />
          <button type="button" onClick={() => changeZoom(0.25)} className={iconButton} aria-label="Aumentar zoom">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className={iconButton}
            aria-label="Girar 90 graus"
            title="Girar 90°"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <p className="text-center text-xs text-rose-400 font-semibold">{errorMsg}</p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="h-11 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!croppedArea || isProcessing}
            className="h-11 rounded-full bg-white text-slate-900 text-sm font-bold inline-flex items-center justify-center gap-2 transition-opacity cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Usar foto
          </button>
        </div>
      </footer>
    </div>,
    document.body
  );
}
