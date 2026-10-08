import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { AppShell } from './AppShell';
import { RegistrationsPage } from '@/features/registrations/pages/RegistrationsPage';
import { AttendancePage } from '@/features/attendance/pages/AttendancePage';
import { DoorAttendancePage } from '@/features/attendance/pages/DoorAttendancePage';
import { LeadershipPage } from '@/features/leadership/pages/LeadershipPage';
import { DashboardPlaceholder } from './pages/DashboardPlaceholder';
import { FinancialPage } from '@/features/financial/pages/FinancialPage';
import { TeamsPage } from '@/features/teams/pages/TeamsPage';
import { TeamDoorAttendancePage } from '@/features/teams/pages/TeamDoorAttendancePage';
import { SettingsPage } from '@/features/settings/pages/SettingsPage';
import { ReportsPage } from '@/features/reports/pages/ReportsPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Rota pública mobile para os colaboradores na porta da igreja */}
      <Route path="/chamada/porta" element={<DoorAttendancePage />} />

      {/* Modo porta da chamada da equipe: exige login no aparelho (gravação restrita a coord/sec) */}
      <Route
        path="/equipes/porta"
        element={
          <ProtectedRoute>
            <TeamDoorAttendancePage />
          </ProtectedRoute>
        }
      />

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
        <Route path="equipes" element={<TeamsPage />} />
        <Route path="financeiro" element={<FinancialPage />} />
        <Route path="relatorios" element={<ReportsPage />} />
        <Route path="configuracoes" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
