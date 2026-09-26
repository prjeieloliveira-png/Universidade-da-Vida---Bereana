import { useRef, useState } from 'react';
import { Camera, Crop, FolderOpen, Loader2, UserCircle2, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import { studentPhotoQueryKey, useStudentPhotoUrl } from '@/shared/hooks/useStudentPhotoUrl';
import { STUDENT_PHOTOS_BUCKET } from '@/shared/utils/studentPhoto';
import { ImageCropModal } from '@/shared/components/ImageCropModal';

interface PhotoUploadProps {
  personId: string;
  currentUrl?: string;
  gender: 'Feminino' | 'Masculino';
  onUploaded: (url: string) => void;
}

type UploadState = 'idle' | 'uploading' | 'error';

const MAX_SOURCE_BYTES = 25 * 1024 * 1024;

export function PhotoUpload({
  personId,
  currentUrl,
  gender,
  onUploaded,
}: PhotoUploadProps) {
  // Dois inputs separados: câmera e arquivos
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();
  const storedPhotoSrc = useStudentPhotoUrl(currentUrl);
  // Preview local (blob) do arquivo recém-escolhido; senão, a foto já salva
  const [preview, setPreview] = useState<string | null>(null);
  const displaySrc = preview ?? storedPhotoSrc;
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Imagem aberta no modal de enquadramento (blob local ou URL assinada)
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const closeCrop = () => {
    // Não revoga o blob do preview atual (caso de "Reenquadrar" logo após enviar)
    if (cropSrc?.startsWith('blob:') && cropSrc !== preview) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  };

  const uploadCropped = async (blob: Blob) => {
    closeCrop();
    // Preview local imediato
    setPreview(URL.createObjectURL(blob));
    setUploadState('uploading');
    setErrorMsg('');

    try {
      // Sempre JPEG após o recorte, sobrescrevendo a foto anterior
      const path = `${personId}/photo.jpg`;

      const { error: uploadError } = await supabase.storage
        .from(STUDENT_PHOTOS_BUCKET)
        .upload(path, blob, { upsert: true, contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      // Bucket privado: salva o caminho do objeto; a exibição usa URL assinada
      await queryClient.invalidateQueries({ queryKey: studentPhotoQueryKey(path) });
      onUploaded(path);
      setUploadState('idle');
    } catch (err) {
      console.error('Erro no upload:', err);
      setErrorMsg('Falha ao enviar a foto. Tente novamente.');
      setUploadState('error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reseta o input para permitir selecionar o mesmo arquivo novamente
    e.target.value = '';
    if (!file) return;

    // O recorte comprime a foto; o limite aqui só evita arquivos absurdos
    if (file.size > MAX_SOURCE_BYTES) {
      setErrorMsg('A foto deve ter no máximo 25 MB.');
      setUploadState('error');
      return;
    }
    setErrorMsg('');
    setUploadState('idle');
    setCropSrc(URL.createObjectURL(file));
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setUploadState('idle');
    setErrorMsg('');
    onUploaded('');
  };

  const avatarBg = gender === 'Feminino' ? '#fce7f3' : '#dbeafe';
  const avatarText = gender === 'Feminino' ? '#9d174d' : '#1e40af';

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar / Preview */}
      <div className="relative group">
        <div
          className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md ring-2 ring-slate-200"
        >
          {displaySrc ? (
            <img
              src={displaySrc}
              alt="Foto do aluno"
              className="w-full h-full object-cover"
            />
          ) : (
            <span
              className="w-full h-full flex items-center justify-center"
              style={{ background: avatarBg }}
            >
              <UserCircle2
                className="w-14 h-14"
                style={{ color: avatarText }}
              />
            </span>
          )}

          {/* Overlay de carregamento */}
          {uploadState === 'uploading' && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </span>
          )}
        </div>

        {/* Botão de remover */}
        {displaySrc && uploadState !== 'uploading' && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 hover:bg-rose-600 flex items-center justify-center shadow-sm transition-colors cursor-pointer z-10"
            title="Remover foto"
            aria-label="Remover foto"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        )}
      </div>

      {/* Dois botões de ação: Câmera e Arquivos */}
      {uploadState !== 'uploading' && (
        <div className="flex items-center gap-2">
          {/* Botão: Abrir câmera */}
          <button
            type="button"
            id="btn-photo-camera"
            onClick={() => cameraRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200"
            title="Tirar foto com a câmera"
            aria-label="Abrir câmera"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Câmera</span>
          </button>

          {/* Botão: Escolher arquivo */}
          <button
            type="button"
            id="btn-photo-file"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200"
            title="Escolher foto dos arquivos"
            aria-label="Escolher foto dos arquivos"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Arquivos</span>
          </button>

          {/* Botão: Reenquadrar a foto atual */}
          {displaySrc && (
            <button
              type="button"
              id="btn-photo-crop"
              onClick={() => setCropSrc(displaySrc)}
              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200"
              title="Reenquadrar foto"
              aria-label="Reenquadrar foto"
            >
              <Crop className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {cropSrc && (
        <ImageCropModal imageSrc={cropSrc} onCancel={closeCrop} onConfirm={uploadCropped} />
      )}

      {/* Input: câmera (capture=user força câmera frontal no mobile) */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        capture="user"
        className="sr-only"
        onChange={handleFileChange}
        aria-hidden="true"
      />

      {/* Input: arquivos (sem capture, abre galeria/explorador) */}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        className="sr-only"
        onChange={handleFileChange}
        aria-hidden="true"
      />

      {/* Mensagens de estado */}
      {uploadState === 'uploading' && (
        <p className="text-[11px] text-slate-500 font-medium animate-pulse">
          Enviando foto…
        </p>
      )}
      {uploadState === 'error' && (
        <p className="text-[11px] text-rose-600 font-semibold text-center max-w-[140px]">
          {errorMsg}
        </p>
      )}
      {uploadState === 'idle' && !displaySrc && (
        <p className="text-[10px] text-slate-400 font-medium text-center">
          Tire uma foto ou escolha da galeria
        </p>
      )}
    </div>
  );
}
