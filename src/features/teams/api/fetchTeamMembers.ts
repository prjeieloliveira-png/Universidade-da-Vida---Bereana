import { supabase } from '@/shared/lib/supabase';
import type { TeamMemberWithDetails, TeamMemberPaymentStatusKind } from '../types/teams';

interface RawMemberData {
  id: string;
  edition_id: string;
  team_role_id: string;
  person_id: string;
  active: boolean;
  is_courtesy: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  people: { id: string; full_name: string; phone: string } | null;
  team_roles: { id: string; name: string; sort_order: number } | null;
}

type PaymentRow = {
  team_member_id: string | null;
  status: string | null;
  registration_fee_cents: number | null;
  total_paid_cents: number | null;
  outstanding_cents: number | null;
  payment_count: number | null;
  is_courtesy?: boolean | null;
};

export async function fetchTeamMembersWithDetails(editionId: string): Promise<TeamMemberWithDetails[]> {
  // 1. Buscar membros com relacionamentos em people e team_roles (sem select(*))
  let rawMembers: RawMemberData[] = [];
  const resPrimary = await supabase
    .from('team_members')
    .select(`
      id, edition_id, team_role_id, person_id, active, is_courtesy, notes, created_at, updated_at,
      people!team_members_person_id_fkey(id, full_name, phone),
      team_roles!team_members_team_role_id_fkey(id, name, sort_order)
    `)
    .eq('edition_id', editionId)
    .order('created_at', { ascending: true });

  if (resPrimary.error) {
    // Fallback caso a migração da coluna is_courtesy ainda não tenha sido aplicada no banco remoto
    const resFallback = await supabase
      .from('team_members')
      .select(`
        id, edition_id, team_role_id, person_id, active, notes, created_at, updated_at,
        people!team_members_person_id_fkey(id, full_name, phone),
        team_roles!team_members_team_role_id_fkey(id, name, sort_order)
      `)
      .eq('edition_id', editionId)
      .order('created_at', { ascending: true });

    if (resFallback.error) throw resFallback.error;
    rawMembers = (resFallback.data ?? []).map((m) => ({
      ...m,
      is_courtesy: false,
    })) as unknown as RawMemberData[];
  } else {
    rawMembers = (resPrimary.data ?? []) as unknown as RawMemberData[];
  }

  // 2. Buscar dados agregados de presença na view
  const { data: attendanceData, error: attendanceError } = await supabase
    .from('v_team_member_attendance')
    .select('team_member_id, total_called_meetings, attended_meetings, attendance_percentage, attendance_fraction')
    .eq('edition_id', editionId);

  if (attendanceError) throw attendanceError;

  // 3. Buscar dados agregados de pagamento na view
  let paymentData: PaymentRow[] = [];
  const payResWithCourtesy = await supabase
    .from('v_team_member_payment_status')
    .select('team_member_id, status, registration_fee_cents, total_paid_cents, outstanding_cents, payment_count, is_courtesy')
    .eq('edition_id', editionId);

  if (payResWithCourtesy.error) {
    // Fallback se a view remota ainda não tiver a coluna is_courtesy
    const payResFallback = await supabase
      .from('v_team_member_payment_status')
      .select('team_member_id, status, registration_fee_cents, total_paid_cents, outstanding_cents, payment_count')
      .eq('edition_id', editionId);

    if (!payResFallback.error && payResFallback.data) {
      paymentData = payResFallback.data;
    }
  } else if (payResWithCourtesy.data) {
    paymentData = payResWithCourtesy.data;
  }

  const attendanceMap = new Map<
    string,
    { totalCalled: number; attended: number; percentage: number; fraction: string }
  >();

  (attendanceData ?? []).forEach((att) => {
    if (att.team_member_id) {
      attendanceMap.set(att.team_member_id, {
        totalCalled: att.total_called_meetings ?? 0,
        attended: att.attended_meetings ?? 0,
        percentage: att.attendance_percentage ?? 0,
        fraction: att.attendance_fraction ?? '0/0',
      });
    }
  });

  const paymentMap = new Map<
    string,
    {
      status: TeamMemberPaymentStatusKind;
      isCourtesy: boolean;
      registrationFeeCents: number;
      totalPaidCents: number;
      outstandingCents: number;
      paymentCount: number;
    }
  >();

  (paymentData ?? []).forEach((p) => {
    if (p.team_member_id) {
      const rawStatus = p.status as TeamMemberPaymentStatusKind;
      const isCourtesy = Boolean(p.is_courtesy);
      paymentMap.set(p.team_member_id, {
        status: isCourtesy ? 'courtesy' : rawStatus || 'pending',
        isCourtesy,
        registrationFeeCents: p.registration_fee_cents ?? 10000,
        totalPaidCents: p.total_paid_cents ?? 0,
        outstandingCents: p.outstanding_cents ?? 10000,
        paymentCount: p.payment_count ?? 0,
      });
    }
  });

  return rawMembers.map((row) => {
    const att = attendanceMap.get(row.id) ?? {
      totalCalled: 0,
      attended: 0,
      percentage: 0,
      fraction: '0/0',
    };

    const isCourtesy = Boolean(row.is_courtesy);
    const pay = paymentMap.get(row.id) ?? {
      status: (isCourtesy ? 'courtesy' : 'pending') as TeamMemberPaymentStatusKind,
      isCourtesy,
      registrationFeeCents: isCourtesy ? 0 : 10000,
      totalPaidCents: 0,
      outstandingCents: isCourtesy ? 0 : 10000,
      paymentCount: 0,
    };

    const finalIsCourtesy = isCourtesy || pay.isCourtesy;
    const finalStatus: TeamMemberPaymentStatusKind = finalIsCourtesy ? 'courtesy' : pay.status;

    return {
      id: row.id,
      editionId: row.edition_id,
      teamRoleId: row.team_role_id,
      personId: row.person_id,
      active: row.active,
      isCourtesy: finalIsCourtesy,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      person: {
        id: row.people?.id ?? row.person_id,
        fullName: row.people?.full_name ?? 'Nome não encontrado',
        phone: row.people?.phone ?? '',
      },
      teamRole: {
        id: row.team_roles?.id ?? row.team_role_id,
        name: row.team_roles?.name ?? 'Equipe não encontrada',
        sortOrder: row.team_roles?.sort_order ?? 999,
      },
      attendance: att,
      payment: {
        ...pay,
        status: finalStatus,
        isCourtesy: finalIsCourtesy,
      },
    };
  });
}
