import { useRef, useState } from 'react';
import { Camera, Loader2, UserCircle2, X } from 'lucide-react';
import { supabase } from '@/shared/lib/supabase';

interface PhotoUploadProps {
  personId: string;
  currentUrl?: string;
  gender: 'Feminino' | 'Masculino';
  onUploaded: (url: string) => void;
}

type UploadState = 'idle' | 'uploading' | 'error';

export function PhotoUpload({
  personId,
  currentUrl,
  gender,
  onUploaded,
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Valida tamanho (máx 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('A foto deve ter no máximo 5 MB.');
      setUploadState('error');
      return;
    }

    // Preview local imediato
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploadState('uploading');
    setErrorMsg('');

    try {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `${personId}/photo.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('student-photos')
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('student-photos')
        .getPublicUrl(path);

      onUploaded(data.publicUrl);
      setUploadState('idle');
    } catch (err) {
      console.error('Erro no upload:', err);
      setErrorMsg('Falha ao enviar a foto. Tente novamente.');
      setUploadState('error');
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setUploadState('idle');
    setErrorMsg('');
    onUploaded('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const avatarBg = gender === 'Feminino' ? '#fce7f3' : '#dbeafe';
  const avatarText = gender === 'Feminino' ? '#9d174d' : '#1e40af';

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Avatar / Preview */}
      <div className="relative group">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md ring-2 ring-slate-200 transition-all hover:ring-[#58bc75] cursor-pointer focus:outline-none focus:ring-[#58bc75]"
          title="Alterar foto"
          aria-label="Alterar foto do aluno"
        >
          {preview ? (
            <img
              src={preview}
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

          {/* Overlay ao passar o mouse */}
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
            {uploadState === 'uploading' ? (
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            ) : (
              <>
                <Camera className="w-5 h-5 text-white" />
                <span className="text-[9px] font-bold text-white uppercase tracking-wide">
                  {preview ? 'Alterar' : 'Adicionar'}
                </span>
              </>
            )}
          </span>
        </button>

        {/* Botão de remover */}
        {preview && uploadState !== 'uploading' && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 hover:bg-rose-600 flex items-center justify-center shadow-sm transition-colors cursor-pointer"
            title="Remover foto"
            aria-label="Remover foto"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        )}
      </div>

      {/* Input oculto */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        capture="user"
        className="sr-only"
        onChange={handleFileChange}
        aria-hidden="true"
      />

      {/* Label e estado */}
      {uploadState === 'uploading' && (
        <p className="text-[11px] text-slate-500 font-medium animate-pulse">
          Enviando foto…
        </p>
      )}
      {uploadState === 'error' && (
        <p className="text-[11px] text-rose-600 font-semibold text-center max-w-[120px]">
          {errorMsg}
        </p>
      )}
      {uploadState === 'idle' && (
        <p className="text-[10px] text-slate-400 font-medium text-center">
          {preview ? 'Toque para alterar' : 'Toque para adicionar foto'}
        </p>
      )}
    </div>
  );
}
