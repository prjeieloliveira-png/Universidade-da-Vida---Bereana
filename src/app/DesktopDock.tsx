import { NavLink } from 'react-router-dom';
import { Settings, LogOut, type LucideIcon } from 'lucide-react';

export interface DockNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

interface DesktopDockProps {
  items: DockNavItem[];
  onLogout: () => void;
}

export function DesktopDock({ items, onLogout }: DesktopDockProps) {
  return (
    <aside className="hidden lg:flex flex-col items-center justify-between w-16 bg-white border border-slate-200/60 rounded-[28px] py-4 shadow-xs shrink-0 self-stretch my-1">
      {/* Top / Main Navigation Icons */}
      <div className="flex flex-col items-center gap-2.5 w-full">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={item.to} className="w-full flex flex-col items-center">
              <NavLink
                to={item.to}
                title={item.label}
                aria-label={item.label}
                className={({ isActive }) =>
                  `w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-[#0d7647] text-white shadow-sm shadow-[#0d7647]/30 scale-102'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
              </NavLink>
              {index === 2 && (
                <div className="w-6 h-[1px] bg-slate-200/70 my-2" />
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Utility Icons: Settings & Logout */}
      <div className="flex flex-col items-center gap-2 w-full pt-4 border-t border-slate-100">
        <button
          type="button"
          title="Configurações"
          aria-label="Configurações"
          className="w-10 h-10 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
        >
          <Settings className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={onLogout}
          title="Sair do sistema"
          aria-label="Sair"
          className="w-10 h-10 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
}
