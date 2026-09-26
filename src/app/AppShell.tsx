import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  DollarSign,
  ShieldCheck,
  Briefcase,
  LogOut,
  Settings,
  Search,
  Bell,
  MoreHorizontal,
} from 'lucide-react';
import { supabase } from '@/shared/lib/supabase';
import { CohortSelector } from '@/features/cohorts/components/CohortSelector';
import { useUserRole } from '@/shared/hooks/useUserRole';
import { useActiveEdition } from '@/shared/hooks/useActiveEdition';
import { useHydrateStudents } from '@/features/registrations/hooks/useHydrateStudents';

import { MobileMoreSheet, type MobileMoreItem } from './MobileMoreSheet';
import { DesktopDock } from './DesktopDock';

export function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isCoordOrSec, fullName } = useUserRole();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Hidrata o studentStore (inclui presença real s1..s9) para todas as telas
  // do shell autenticado, mesmo sem passar por Inscrições antes.
  const { data: activeEdition } = useActiveEdition();
  useHydrateStudents(activeEdition?.id);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Itens para desktop
  const desktopNavItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/inscricoes', label: 'Inscrições', icon: Users },
    { to: '/chamada', label: 'Chamada', icon: CheckSquare },
    { to: '/liderancas', label: 'Liderança', icon: ShieldCheck },
    ...(isCoordOrSec
      ? [
          { to: '/equipes', label: 'Equipes', icon: Briefcase },
          { to: '/financeiro', label: 'Financeiro', icon: DollarSign },
        ]
      : []),
  ];

  // Itens primários da barra mobile (4 itens fixos)
  const mobilePrimaryItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/inscricoes', label: 'Inscrições', icon: Users },
    { to: '/chamada', label: 'Chamada', icon: CheckSquare },
    ...(isCoordOrSec
      ? [{ to: '/equipes', label: 'Equipes', icon: Briefcase }]
      : [{ to: '/liderancas', label: 'Liderança', icon: ShieldCheck }]),
  ];

  // Itens do menu "Mais" no mobile (apenas para coord/sec)
  const mobileMoreItems: MobileMoreItem[] = [
    { to: '/liderancas', label: 'Liderança', icon: ShieldCheck, desc: 'Catálogo de pastores, G12s e líderes' },
    { to: '/financeiro', label: 'Financeiro', icon: DollarSign, desc: 'Gestão de caixa, pagamentos e fluxo' },
  ];

  const isMoreItemActive = mobileMoreItems.some((item) => location.pathname === item.to);

  // Iniciais do nome
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('') || 'UV';

  return (
    <div className="min-h-screen bg-[#e9edf0] text-slate-900 flex flex-col p-0 sm:p-3 lg:p-4 pb-24 sm:pb-24 lg:pb-4">
      {/* Outer Floating Desktop Canvas */}
      <div className="flex-1 bg-white sm:rounded-[32px] sm:border sm:border-slate-200/70 sm:shadow-xs flex flex-col overflow-hidden max-w-[1536px] w-full mx-auto min-h-[calc(100vh-2rem)]">
        {/* Top Header Navigation (Desktop & Mobile) */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3.5 border-b border-slate-150">
          <div className="flex items-center justify-between gap-4">
            {/* Brand Logo & Desktop Nav Pills */}
            <div className="flex items-center gap-6">
              {/* Logo */}
              <div className="flex items-center gap-2.5">
                <img
                  src="/logo-uv-mark.png"
                  alt="Universidade da Vida"
                  className="w-8 h-9 sm:w-9 sm:h-10 object-contain drop-shadow-xs"
                />
                <div className="hidden sm:block">
                  <h1 className="font-black text-sm text-slate-900 leading-tight tracking-tight">
                    Univ. da Vida
                  </h1>
                  <p className="text-[11px] font-semibold text-slate-400">Bereana</p>
                </div>
              </div>

              {/* Desktop Pill Navigation (Quixotic style) */}
              <nav className="hidden md:flex items-center gap-1 bg-[#f4f6f8] border border-slate-200/60 p-1 rounded-full shadow-2xs">
                {desktopNavItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `px-4 py-1.5 rounded-full text-xs font-semibold transition-all min-h-[32px] flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                      }`
                    }
                  >
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* Right Section: Cohort & Actions */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Global Cohort Switcher */}
              <CohortSelector />

              {/* Action Buttons */}
              <button
                type="button"
                className="w-9 h-9 rounded-full bg-white border border-slate-200/80 hover:bg-slate-50 active:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors shadow-2xs cursor-pointer"
                title="Buscar"
                aria-label="Buscar"
              >
                <Search className="w-4 h-4" />
              </button>

              <button
                type="button"
                className="w-9 h-9 rounded-full bg-white border border-slate-200/80 hover:bg-slate-50 active:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors shadow-2xs cursor-pointer"
                title="Notificações"
                aria-label="Notificações"
              >
                <Bell className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/financeiro?config=categorias')}
                className="w-9 h-9 rounded-full bg-white border border-slate-200/80 hover:bg-slate-50 active:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors shadow-2xs cursor-pointer"
                title="Configurações (Categorias)"
                aria-label="Configurações"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* User Avatar Capsule */}
              <div className="flex items-center gap-2 pl-1">
                <div className="relative" title={fullName}>
                  <div className="w-9 h-9 rounded-full bg-[#163242] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                    {initials}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#0d7647] border-2 border-white" />
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sair"
                  className="w-8 h-8 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area with Desktop Dock Rail & Main Content */}
        <div className="flex-1 flex gap-5 p-4 sm:p-6 lg:p-7 min-w-0 bg-[#f8fafc]/50">
          {/* Left Vertical Dock Rail (Desktop) */}
          <DesktopDock items={desktopNavItems} onLogout={handleLogout} />

          {/* Main Page Content */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile Floating Pill Tab Bar (390px viewports) */}
      <nav className="md:hidden fixed bottom-3 inset-x-4 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-full shadow-lg z-40 flex items-center justify-around h-14 px-2">
        {mobilePrimaryItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsMoreMenuOpen(false)}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-full transition-all ${
                  isActive
                    ? 'text-[#0d7647] font-bold scale-105'
                    : 'text-slate-400 hover:text-slate-700'
                }`
              }
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="text-[10px] truncate">{item.label}</span>
            </NavLink>
          );
        })}

        {/* 5th Mobile Item: Mais button */}
        {isCoordOrSec && (
          <button
            type="button"
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-full transition-all cursor-pointer ${
              isMoreItemActive || isMoreMenuOpen
                ? 'text-[#0d7647] font-bold scale-105'
                : 'text-slate-400 hover:text-slate-700'
            }`}
            aria-label="Abrir menu mais opções"
          >
            <MoreHorizontal className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Mais</span>
          </button>
        )}
      </nav>

      {/* Mobile "Mais" Bottom Sheet */}
      <MobileMoreSheet
        isOpen={isMoreMenuOpen}
        onClose={() => setIsMoreMenuOpen(false)}
        items={mobileMoreItems}
        currentPath={location.pathname}
      />
    </div>
  );
}
