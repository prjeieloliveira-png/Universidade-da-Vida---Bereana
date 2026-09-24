import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, CheckSquare } from 'lucide-react';
import { useStudentStore } from '@/features/registrations/store/studentStore';
import { useCohortStore } from '@/features/cohorts/store/cohortStore';
import { useActiveEdition } from '@/shared/hooks/useActiveEdition';
import { fetchCashSummary } from '@/features/financial/data/financialData';
import { CoordinatorHeroCard } from '@/features/dashboard/components/CoordinatorHeroCard';
import { AttendanceMatrixCard } from '@/features/dashboard/components/AttendanceMatrixCard';
import { NetworkDistributionCard } from '@/features/dashboard/components/NetworkDistributionCard';
import { RegistrationGaugeCard } from '@/features/dashboard/components/RegistrationGaugeCard';
import { LessonsProgressCard } from '@/features/dashboard/components/LessonsProgressCard';
import { RecentRegistrationsCard, ParticipantItem } from '@/features/dashboard/components/RecentRegistrationsCard';
import { FinancialSummaryCard } from '@/features/dashboard/components/FinancialSummaryCard';

export function DashboardPlaceholder() {
  const navigate = useNavigate();
  const { students } = useStudentStore();
  const { activeCohortId, getActiveCohort } = useCohortStore();
  const activeCohort = getActiveCohort();

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
    const family = cohortStudents.filter((s) => s.pastor.includes('Socorro')).length;
    const youth = total - family;

    const feeCents = activeCohort.registrationFeeCents || 20000;
    const collectedCents = paid * feeCents;
    const pendingCents = pending * feeCents;
    const paymentRate = total > 0 ? Math.round((paid / total) * 100) : 0;

    const familyPct = total > 0 ? Math.round((family / total) * 100) : 50;
    const youthPct = 100 - familyPct;

    // Recent 5 participants
    const recent: ParticipantItem[] = cohortStudents.slice(0, 5).map((s) => ({
      id: s.id,
      name: s.name,
      network: `${s.pastor} • ${s.g12}`,
      statusLabel: s.status,
      statusVariant: s.status === 'Pago' ? 'success' : 'warning',
      amountFormatted: `R$ ${(feeCents / 100).toFixed(2).replace('.', ',')}`,
    }));

    return {
      total,
      paid,
      pending,
      family,
      youth,
      collectedCents,
      pendingCents,
      paymentRate,
      familyPct,
      youthPct,
      recent,
    };
  }, [cohortStudents, activeCohort]);

  // Indicadores consolidados do financeiro (Supabase ou fallback)
  const hasRemoteCash = cashSummary && (cashSummary.total_in_cents > 0 || cashSummary.total_registrations > 0);
  const totalCollectedCents = hasRemoteCash ? cashSummary.total_in_cents : metrics.collectedCents;
  const totalPendingCents = hasRemoteCash ? cashSummary.total_receivable_cents : metrics.pendingCents;
  const paymentRatePercentage = hasRemoteCash && cashSummary.total_registrations > 0
    ? Math.round((cashSummary.paid_count / cashSummary.total_registrations) * 100)
    : metrics.paymentRate;

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
            <span>Portal</span>
            <span>&gt;</span>
            <span className="text-slate-600 font-semibold">Dashboard</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Visão Geral — {activeCohort.name}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Acompanhamento em tempo real da turma, presenças e finanças
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/inscricoes')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold bg-[#58bc75] hover:bg-[#4caa68] active:bg-[#419a5c] text-white transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Aluno</span>
          </button>

          <button
            onClick={() => navigate('/chamada')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold bg-[#163242] hover:bg-[#20445a] active:bg-[#122835] text-white transition-colors shadow-sm cursor-pointer"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Fazer Chamada</span>
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Side Column (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Top Row: Coordinator Hero + Attendance Matrix + Network Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="md:col-span-4">
              <CoordinatorHeroCard
                name="Pr. Jeiel Oliveira"
                role="Coordenação Geral"
                church="Bereana 2026"
              />
            </div>

            <div className="md:col-span-4">
              <AttendanceMatrixCard
                averagePresence={88}
                completedLessons={2}
                totalLessons={9}
              />
            </div>

            <div className="md:col-span-4">
              <NetworkDistributionCard
                familyPercentage={metrics.familyPct}
                youthPercentage={metrics.youthPct}
              />
            </div>
          </div>

          {/* Bottom Row: Goal Gauge + Lessons Progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <RegistrationGaugeCard
              totalRegistered={metrics.total}
              maxCapacity={activeCohort.targetStudents || 70}
              familyCount={metrics.family}
              youthCount={metrics.youth}
              onViewAll={() => navigate('/inscricoes')}
            />

            <LessonsProgressCard
              onStartAttendance={() => navigate('/chamada')}
            />
          </div>
        </div>

        {/* Right Side Column (4 cols on lg): Recent Participants + Financial Card */}
        <div className="lg:col-span-4 space-y-5">
          <RecentRegistrationsCard
            participants={metrics.recent}
            onViewAll={() => navigate('/inscricoes')}
          />

          <FinancialSummaryCard
            totalCollectedCents={totalCollectedCents}
            totalPendingCents={totalPendingCents}
            paymentRatePercentage={paymentRatePercentage}
            onOpenCashflow={() => navigate('/financeiro')}
          />
        </div>
      </div>
    </div>
  );
}
