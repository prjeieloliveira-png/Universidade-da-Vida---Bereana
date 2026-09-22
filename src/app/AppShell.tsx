import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  CheckSquare,
  DollarSign,
  ShieldCheck,
  LogOut,
  Wifi,
  Search,
  Bell,
} from 'lucide-react';
import { supabase } from '@/shared/lib/supabase';

export function AppShell() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/inscricoes', label: 'Inscrições', icon: Users },
    { to: '/chamada', label: 'Chamada', icon: CheckSquare },
    { to: '/liderancas', label: 'Liderança', icon: ShieldCheck },
    { to: '/financeiro', label: 'Financeiro', icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-slate-900 flex flex-col pb-28 sm:pb-24 md:pb-6">
      {/* Top Header Navigation (Desktop & Mobile) */}
      <header className="sticky top-0 z-40 bg-[#f4f6f8]/90 backdrop-blur-md px-4 sm:px-8 py-3.5 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo & Desktop Nav Pills */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#58bc75] text-white flex items-center justify-center shadow-xs">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-extrabold text-sm text-slate-900 leading-tight tracking-tight">
                  Univ. da Vida
                </h1>
                <p className="text-[11px] font-medium text-slate-400">Bereana 2026</p>
              </div>
            </div>

            {/* Desktop Pill Navigation (Inspired directly by reference) */}
            <nav className="hidden md:flex items-center gap-1.5 bg-white/70 border border-slate-200/60 p-1 rounded-full shadow-xs">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#58bc75] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Right Section: Search & Actions */}
          <div className="flex items-center gap-2.5">
            {/* Desktop Search Pill */}
            <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 bg-white border border-slate-200/70 rounded-full text-xs text-slate-400 shadow-xs w-48">
              <Search className="w-3.5 h-3.5" />
              <span>Buscar aluno...</span>
            </div>

            {/* Sync Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200/70 rounded-full text-xs font-medium shadow-xs">
              <Wifi className="w-3 h-3 text-[#58bc75]" />
              <span className="text-[11px] text-slate-700 hidden sm:inline">Online</span>
            </div>

            {/* Notification Bell */}
            <button
              className="w-8 h-8 rounded-full bg-white border border-slate-200/70 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors shadow-xs cursor-pointer"
              title="Notificações"
            >
              <Bell className="w-3.5 h-3.5" />
            </button>

            {/* User Avatar Capsule */}
            <div className="flex items-center gap-2 pl-1">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-[#163242] text-white flex items-center justify-center font-bold text-xs">
                  JO
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#58bc75] border-2 border-white" />
              </div>
              <button
                onClick={handleLogout}
                title="Sair"
                className="w-8 h-8 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-8 py-5 max-w-7xl w-full mx-auto">
        <Outlet />
      </main>

      {/* Mobile Floating Pill Tab Bar (390px viewports) */}
      <nav className="md:hidden fixed bottom-3 inset-x-4 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-full shadow-lg z-40 flex items-center justify-around h-14 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all ${
                  isActive
                    ? 'text-[#2e844b] font-bold scale-105'
                    : 'text-slate-400 hover:text-slate-700'
                }`
              }
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="text-[10px]">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
