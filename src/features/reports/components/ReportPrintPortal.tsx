import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ReportPrintPortalProps {
  orientation: 'portrait' | 'landscape';
  children: ReactNode;
}

/** Renderiza a cópia de impressão em #report-print-root (fora do app) e fixa o tamanho de página A4. */
export function ReportPrintPortal({ orientation, children }: ReportPrintPortalProps) {
  const [root, setRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const el = document.createElement('div');
    el.id = 'report-print-root';
    document.body.appendChild(el);
    setRoot(el);
    return () => {
      document.body.removeChild(el);
    };
  }, []);

  if (!root) return null;
  return createPortal(
    <>
      <style>{`@media print { @page { size: A4 ${orientation}; } }`}</style>
      {children}
    </>,
    root
  );
}
