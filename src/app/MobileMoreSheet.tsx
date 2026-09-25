import React from 'react';
import { NavLink } from 'react-router-dom';
import { X, ChevronRight, type LucideIcon } from 'lucide-react';

export interface MobileMoreItem {
  to: string;
  label: string;
  icon: LucideIcon;
  desc: string;
}

interface MobileMoreSheetProps {
  isOpen: boolean;
  onClose: () => void;
  items: MobileMoreItem[];
  currentPath: string;
}

export const MobileMoreSheet: React.FC<MobileMoreSheetProps> = ({
  isOpen,
  onClose,
  items,
  currentPath,
}) => {
  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-50 flex items-end justify-center animate-in fade-in duration-150">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white rounded-t-3xl shadow-2xl p-5 space-y-4 mb-16 mx-2 border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <span className="font-extrabold text-xs uppercase tracking-wider text-slate-400">
            Mais Módulos
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900"
            aria-label="Fechar menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={`flex items-center justify-between p-3.5 rounded-2xl transition-all ${
                  isActive
                    ? 'bg-[#e8f8ee] border border-[#c4e3d0] text-slate-900 font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isActive
                        ? 'bg-[#58bc75] text-white'
                        : 'bg-white text-slate-600 shadow-2xs'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{item.label}</p>
                    <p className="text-[11px] text-slate-400">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
};
