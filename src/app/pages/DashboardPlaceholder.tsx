import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, CheckSquare } from 'lucide-react';
import { useStudentStore } from '@/features/registrations/store/studentStore';
import { useCohortStore } from '@/features/cohorts/store/cohortStore';
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

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Page Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
            <span>Portal</span>
            <span>&gt;</span>
            <span className="text-slate-600 font-semibold">Dashboard</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Bom dia, Coordenação
          </h2>
        </div>

        {/* Action Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/inscricoes')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            <span>Nova Inscrição</span>
          </button>

          <div className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-white border border-slate-200/80 text-slate-600 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{activeCohort.name}</span>
          </div>

          <button
            onClick={() => navigate('/chamada')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-[#58bc75] hover:bg-[#4eaa69] text-white transition-colors shadow-xs cursor-pointer"
          >
            <CheckSquare className="w-3.5 h-3.5 text-white" />
            <span>Fazer Chamada</span>
          </button>
        </div>
      </div>

      {/* Main Responsive Grid: 2 Columns on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left / Center Main Area (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Top Row: Profile Card + Presence Matrix + Network Card */}
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
            totalCollectedCents={metrics.collectedCents}
            totalPendingCents={metrics.pendingCents}
            paymentRatePercentage={metrics.paymentRate}
            onOpenCashflow={() => navigate('/financeiro')}
          />
        </div>
      </div>
    </div>
  );
}
