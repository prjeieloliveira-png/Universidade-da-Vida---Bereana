import React from 'react';

export interface AttendanceBadgeProps {
  attended: number;
  called: number;
  percentage?: number;
  className?: string;
  size?: 'sm' | 'md';
}

export function getAttendanceColorClasses(percentage: number, called: number): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  if (called === 0) {
    return {
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      border: 'border-slate-200',
      dot: 'bg-slate-400',
    };
  }

  if (percentage >= 75) {
    return {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500',
    };
  }

  if (percentage >= 50) {
    return {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
    };
  }

  return {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
  };
}

export const AttendanceBadge: React.FC<AttendanceBadgeProps> = ({
  attended,
  called,
  percentage,
  className = '',
  size = 'md',
}) => {
  const calcPct =
    percentage !== undefined
      ? percentage
      : called > 0
        ? Math.round((attended / called) * 100)
        : 0;

  const colors = getAttendanceColorClasses(calcPct, called);
  const sizeClasses =
    size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      data-testid="attendance-badge"
      className={`inline-flex items-center gap-1.5 font-bold rounded-full border ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      <span>
        {attended}/{called} – {Math.round(calcPct)}%
      </span>
    </span>
  );
};
