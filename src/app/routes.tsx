import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { AppShell } from './AppShell';
import { RegistrationsPage } from '@/features/registrations/pages/RegistrationsPage';
import { AttendancePage } from '@/features/attendance/pages/AttendancePage';
import { LeadershipPage } from '@/features/leadership/pages/LeadershipPage';
import { DashboardPlaceholder } from './pages/DashboardPlaceholder';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPlaceholder />} />
        <Route path="inscricoes" element={<RegistrationsPage />} />
        <Route path="chamada" element={<AttendancePage />} />
        <Route path="liderancas" element={<LeadershipPage />} />
        <Route
          path="financeiro"
          element={
            <div className="p-4 bg-white rounded-2xl border border-slate-200 text-center py-12">
              <h3 className="text-base font-bold text-slate-800">Módulo de Caixa & Pagamentos</h3>
              <p className="text-xs text-slate-500 mt-1">Será implementado na Fase 6.</p>
            </div>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
