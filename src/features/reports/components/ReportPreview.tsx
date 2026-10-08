import { useEffect, useRef, useState, type ReactNode } from 'react';

const MM_TO_PX = 96 / 25.4;

interface ReportPreviewProps {
  orientation: 'portrait' | 'landscape';
  children: ReactNode;
}

/** Mostra a folha A4 reduzida para caber na largura disponível (celular incluso). */
export function ReportPreview({ orientation, children }: ReportPreviewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const sheetPx = (orientation === 'portrait' ? 210 : 297) * MM_TO_PX;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setZoom(Math.min(1, el.clientWidth / sheetPx));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [sheetPx]);

  return (
    <div ref={ref} className="w-full overflow-hidden bg-slate-200/60 rounded-2xl p-0 sm:p-3">
      <div style={{ zoom }}>{children}</div>
    </div>
  );
}
