import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Calendar, CheckSquare } from 'lucide-react';
import { useStudentStore } from '@/features/registrations/store/studentStore';
import { useCohortStore } from '@/features/cohorts/store/cohortStore';
import { useActiveEdition } from '@/shared/hooks/useActiveEdition';
import { useUserRole } from '@/shared/hooks/useUserRole';
import { fetchCashSummary } from '@/features/financial/data/financialData';
import { FinancialSummaryCard } from '@/features/dashboard/components/FinancialSummaryCard';
import { LessonsProgressCard } from '@/features/dashboard/components/LessonsProgressCard';
import { CashflowSparklineCard } from '@/features/dashboard/components/CashflowSparklineCard';
import { RecentRegistrationsCard, ParticipantItem } from '@/features/dashboard/components/RecentRegistrationsCard';
import { TeamAvatarsCard } from '@/features/dashboard/components/TeamAvatarsCard';

export function DashboardPlaceholder() {
  const navigate = useNavigate();
  const { students } = useStudentStore();
  const { activeCohortId, getActiveCohort } = useCohortStore();
  const activeCohort = getActiveCohort();
  const { fullName } = useUserRole();
  const firstName = fullName.split(' ').filter(Boolean)[0] || 'Líder';

  const { data: activeEdition } = useActiveEdition();
  const editionId = activeEdition?.id ?? '';

  const { data: cashSummary } = useQuery({
    queryKey: ['cash-summary', editionId],
    queryFn: () => fetchCashSummary(editionId),
    enabled: !!editionId,
    staleTime: 30_000,
  });

  const cohortStudents = useMemo(() => {
    return students.filter((s) => (s.cohortId || 'turma-01') === activeCohortId);
  }, [students, activeCohortId]);

  // Dynamic calculations based on cohort students
  const metrics = useMemo(() => {
    const total = cohortStudents.length;
    const paid = cohortStudents.filter((s) => s.status === 'Pago').length;
    const pending = total - paid;
    const feeCents = activeCohort.registrationFeeCents || 20000;
    const collectedCents = paid * feeCents;
    const pendingCents = pending * feeCents;
    const paymentRate = total > 0 ? Math.round((paid / total) * 100) : 0;

    // Recent participants
    const recent: ParticipantItem[] = cohortStudents.slice(0, 5).map((s) => ({
      id: s.id,
      name: s.name,
      network: `${s.pastor} • ${s.g12}`,
      statusLabel: s.status === 'Pago' ? 'Confirmado' : 'Pendente',
      statusVariant: s.status === 'Pago' ? 'success' : 'warning',
      amountFormatted: `R$ ${(feeCents / 100).toFixed(2).replace('.', ',')}`,
      dateStr: 'Hoje',
      timeStr: '10:30',
    }));

    return {
      total,
      paid,
      pending,
      collectedCents,
      pendingCents,
      paymentRate,
      recent,
    };
  }, [cohortStudents, activeCohort]);

  // Indicadores consolidados do financeiro (Supabase ou fallback)
  const hasRemoteCash = cashSummary && (cashSummary.total_in_cents > 0 || cashSummary.total_registrations > 0);
  const totalCollectedCents = hasRemoteCash ? cashSummary.total_registration_paid_cents : metrics.collectedCents;
  const totalPendingCents = hasRemoteCash ? cashSummary.total_receivable_cents : metrics.pendingCents;
  const paymentRatePercentage = hasRemoteCash && cashSummary.total_registrations > 0
    ? Math.round((cashSummary.paid_count / cashSummary.total_registrations) * 100)
    : metrics.paymentRate;
  const paidCount = hasRemoteCash ? cashSummary.paid_count : metrics.paid;
  const partialCount = hasRemoteCash ? cashSummary.partial_count : 0;
  const pendingCount = hasRemoteCash ? cashSummary.pending_count : metrics.pending;
  const totalRegistrations = hasRemoteCash ? cashSummary.total_registrations : metrics.total;

  return (
    <div className="space-y-6">
      {/* Top Greeting Header (Quixotic style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-normal text-slate-700 tracking-tight">
            Bem-vindo(a), <span className="font-extrabold text-slate-900">{firstName}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Painel consolidado da turma e fluxo operacional
          </p>
        </div>

        {/* Right Action Pills (Quixotic style) */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold bg-white border border-slate-200/80 text-slate-700 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{activeCohort.name}</span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/inscricoes')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-[#0d7647] hover:bg-[#095a36] text-white transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Aluno</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/chamada')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800 transition-colors shadow-2xs cursor-pointer"
          >
            <CheckSquare className="w-4 h-4 text-[#0d7647]" />
            <span className="hidden sm:inline">Fazer Chamada</span>
            <span className="sm:hidden">Chamada</span>
          </button>
        </div>
      </div>

      {/* Quixotic Main 3-Column Top Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-5">
        {/* Column 1: Financial Goal / Quixotic Meta & Quitação Panel */}
        <div className="xl:col-span-4 flex flex-col">
          <FinancialSummaryCard
            totalCollectedCents={totalCollectedCents}
            totalPendingCents={totalPendingCents}
            paymentRatePercentage={paymentRatePercentage}
            paidCount={paidCount}
            partialCount={partialCount}
            pendingCount={pendingCount}
            totalRegistrations={totalRegistrations}
            totalRegistrationGoalCents={hasRemoteCash ? cashSummary.total_registration_goal_cents : undefined}
            totalTeamMembers={hasRemoteCash ? cashSummary.total_team_members : 0}
            teamPaidCount={hasRemoteCash ? cashSummary.team_paid_count : 0}
            teamPartialCount={hasRemoteCash ? cashSummary.team_partial_count : 0}
            teamPendingCount={hasRemoteCash ? cashSummary.team_pending_count : 0}
            totalTeamGoalCents={hasRemoteCash ? cashSummary.total_team_goal_cents : 0}
            totalTeamPaidCents={hasRemoteCash ? cashSummary.total_team_paid_cents : 0}
            totalTeamReceivableCents={hasRemoteCash ? cashSummary.total_team_receivable_cents : 0}
            onOpenCashflow={() => navigate('/financeiro')}
          />
        </div>


        {/* Column 2: Engagement Rate / Weekly Attendance Bar Chart */}
        <div className="xl:col-span-5 flex flex-col">
          <LessonsProgressCard
            onStartAttendance={() => navigate('/chamada')}
          />
        </div>

        {/* Column 3: Total Balance Sparkline & Team */}
        <div className="xl:col-span-3 flex flex-col gap-5 md:col-span-2 xl:col-span-3">
          <CashflowSparklineCard
            totalBalanceCents={totalCollectedCents}
            onOpenFinancial={() => navigate('/financeiro')}
            onAddPayment={() => navigate('/financeiro')}
          />

          <TeamAvatarsCard
            totalRegistered={metrics.total}
            maxCapacity={activeCohort.targetStudents || 70}
            onViewTeams={() => navigate('/equipes')}
            onViewRegistrations={() => navigate('/inscricoes')}
          />
        </div>
      </div>

      {/* Quixotic Row 2: Recent Payment / Registration History Table */}
      <div className="w-full">
        <RecentRegistrationsCard
          participants={metrics.recent}
          onViewAll={() => navigate('/inscricoes')}
        />
      </div>
    </div>
  );
}
