import { clsx } from 'clsx';

export type PillVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface PillBadgeProps {
  label: string;
  variant?: PillVariant;
  showDot?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

const variantStyles: Record<PillVariant, { pill: string; dot: string }> = {
  success: {
    pill: 'bg-[#e8f8ee] text-[#2e844b] border border-[#c6eed3]',
    dot: 'bg-[#48bb78]',
  },
  warning: {
    pill: 'bg-amber-50 text-amber-800 border border-amber-200/60',
    dot: 'bg-amber-500',
  },
  danger: {
    pill: 'bg-rose-50 text-rose-700 border border-rose-200/60',
    dot: 'bg-rose-500',
  },
  info: {
    pill: 'bg-sky-50 text-sky-700 border border-sky-200/60',
    dot: 'bg-sky-500',
  },
  neutral: {
    pill: 'bg-slate-100 text-slate-600 border border-slate-200/60',
    dot: 'bg-slate-400',
  },
};

export function PillBadge({
  label,
  variant = 'neutral',
  showDot = true,
  className,
  size = 'md',
}: PillBadgeProps) {
  const styles = variantStyles[variant];

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full font-medium transition-colors',
        size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs',
        styles.pill,
        className
      )}
    >
      {showDot && <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', styles.dot)} />}
      <span>{label}</span>
    </span>
  );
}
