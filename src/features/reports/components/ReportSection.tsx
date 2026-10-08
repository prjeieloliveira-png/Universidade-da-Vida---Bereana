import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface ReportSectionProps {
  title: string;
  badge?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function ReportSection({ title, badge, defaultOpen = false, children }: ReportSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left cursor-pointer hover:bg-slate-50"
      >
        <span className="text-sm font-black text-slate-900">
          {title}
          {badge && <span className="ml-2 text-[11px] font-bold text-[#0d7647] bg-[#e8f7ee] px-2 py-0.5 rounded-full">{badge}</span>}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-4 pb-4 pt-1">{children}</div>}
    </section>
  );
}
