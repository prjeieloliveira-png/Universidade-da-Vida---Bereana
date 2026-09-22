interface StudentAttendanceChipsProps {
  s1: boolean;
  s2: boolean;
  s3: boolean;
  s4: boolean;
  s5?: boolean;
  s6?: boolean;
  s7?: boolean;
  s8?: boolean;
  s9?: boolean;
  compactOnly?: boolean;
}

export function StudentAttendanceChips({
  s1,
  s2,
  s3,
  s4,
  s5 = false,
  s6 = false,
  s7 = false,
  s8 = false,
  s9 = false,
  compactOnly = false,
}: StudentAttendanceChipsProps) {
  const sessions = [
    { label: 'S1', present: s1 },
    { label: 'S2', present: s2 },
    { label: 'S3', present: s3 },
    { label: 'S4', present: s4 },
    { label: 'S5', present: s5 },
    { label: 'S6', present: s6 },
    { label: 'S7', present: s7 },
    { label: 'S8', present: s8 },
    { label: 'S9', present: s9 },
  ];

  const presentCount = sessions.filter((s) => s.present).length;

  if (compactOnly) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${
          presentCount >= 5
            ? 'bg-[#e8f8ee] text-[#1a5b32] border border-[#c4e3d0]'
            : presentCount > 0
            ? 'bg-slate-100 text-slate-700 border border-slate-200'
            : 'bg-rose-50 text-rose-700 border border-rose-200/80'
        }`}
        title={`${presentCount} presenças em 9 semanas`}
      >
        <span>{presentCount}/9 Presenças</span>
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      {/* Mobile Badge */}
      <span
        className={`sm:hidden inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
          presentCount >= 5
            ? 'bg-[#e8f8ee] text-[#1a5b32]'
            : presentCount > 0
            ? 'bg-slate-100 text-slate-700'
            : 'bg-rose-50 text-rose-700'
        }`}
      >
        {presentCount}/9 P
      </span>

      {/* 9 Micro Dots on Tablet/Desktop with Tooltips */}
      <div className="hidden sm:flex items-center gap-1 bg-slate-50 border border-slate-200/70 px-2 py-1 rounded-xl">
        {sessions.map((sess) => (
          <span
            key={sess.label}
            className={`w-4 h-4 rounded-md text-[9px] font-black flex items-center justify-center transition-all ${
              sess.present
                ? 'bg-[#58bc75] text-white shadow-2xs'
                : 'bg-slate-200/80 text-slate-400'
            }`}
            title={`${sess.label}: ${sess.present ? 'Presente' : 'Ausente'}`}
          >
            {sess.label.replace('S', '')}
          </span>
        ))}
      </div>
    </div>
  );
}
