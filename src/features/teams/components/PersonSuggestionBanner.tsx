import React from 'react';
import { UserCheck } from 'lucide-react';

interface PersonSuggestionBannerProps {
  fullName: string;
  onApply: () => void;
}

export const PersonSuggestionBanner: React.FC<PersonSuggestionBannerProps> = ({
  fullName,
  onApply,
}) => {
  return (
    <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-2 text-xs text-emerald-800 animate-in fade-in">
      <div className="flex items-center gap-1.5 min-w-0">
        <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span className="truncate">
          Encontrado: <strong>{fullName}</strong>
        </span>
      </div>
      <button
        type="button"
        onClick={onApply}
        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-full shrink-0 transition-colors cursor-pointer"
      >
        Usar este
      </button>
    </div>
  );
};
