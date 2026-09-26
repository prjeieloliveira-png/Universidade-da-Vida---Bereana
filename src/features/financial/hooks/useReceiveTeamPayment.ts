import { useState, useMemo, useRef, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchTeamMemberPaymentStatuses,
  registerTeamMemberPayment,
} from '../data/financialData';
import type { PaymentMethodKey } from '../types';
import { supabase } from '@/shared/lib/supabase';
import type { TeamMemberOption } from '../components/ReceiveTeamPaymentModal';

type Step = 'search' | 'form' | 'success';

const DEFAULT_AMOUNT_CENTS = 10000;

/** Estado, dados e ações do fluxo de recebimento de pagamento de um membro de equipe. */
export function useReceiveTeamPayment(isOpen: boolean, editionId: string) {
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<TeamMemberOption | null>(null);
  const [amountCents, setAmountCents] = useState(DEFAULT_AMOUNT_CENTS);
  const [method, setMethod] = useState<PaymentMethodKey>('pix');
  const [payDate, setPayDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [successAmount, setSuccessAmount] = useState(0);
  const [successOutstanding, setSuccessOutstanding] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('search');
        setSearchQuery('');
        setSelected(null);
        setAmountCents(DEFAULT_AMOUNT_CENTS);
        setMethod('pix');
        setPayDate(new Date().toISOString().slice(0, 10));
        setNotes('');
      }, 300);
    }
    if (isOpen) setTimeout(() => searchRef.current?.focus(), 100);
  }, [isOpen]);

  const { data: statuses = [], isLoading: isLoadingStatuses } = useQuery({
    queryKey: ['team-member-payment-statuses', editionId],
    queryFn: () => fetchTeamMemberPaymentStatuses(editionId),
    enabled: isOpen,
    staleTime: 15_000,
  });

  const { data: membersRaw = [], isLoading: isLoadingMembers } = useQuery({
    queryKey: ['team-members-with-people', editionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('id, person_id, active, team_role_id, team_roles(name), people(full_name, phone)')
        .eq('edition_id', editionId)
        .eq('active', true);
      if (error) throw error;
      return data ?? [];
    },
    enabled: isOpen,
    staleTime: 60_000,
  });

  const members = useMemo<TeamMemberOption[]>(() => {
    return membersRaw.map((m) => {
      const st = statuses.find((s) => s.team_member_id === m.id);
      const role = m.team_roles as { name: string } | null;
      const person = m.people as { full_name: string; phone: string } | null;
      return {
        team_member_id: m.id,
        person_id: m.person_id,
        full_name: person?.full_name ?? '—',
        phone: person?.phone ?? '',
        team_role_name: role?.name ?? '—',
        outstanding_cents: st?.outstanding_cents ?? DEFAULT_AMOUNT_CENTS,
        total_paid_cents: st?.total_paid_cents ?? 0,
        status: st?.status ?? 'pending',
      };
    });
  }, [membersRaw, statuses]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const q = searchQuery.toLowerCase();
    return members.filter(
      (m) => m.full_name.toLowerCase().includes(q) || m.team_role_name.toLowerCase().includes(q)
    );
  }, [members, searchQuery]);

  const payMutation = useMutation({
    mutationFn: () =>
      registerTeamMemberPayment({
        team_member_id: selected!.team_member_id,
        edition_id: editionId,
        amount_cents: amountCents,
        method,
        pay_date: payDate,
        notes: notes.trim() || undefined,
      }),
    onSuccess: () => {
      const outAfter = Math.max(0, (selected?.outstanding_cents ?? 0) - amountCents);
      setSuccessAmount(amountCents);
      setSuccessOutstanding(outAfter);
      setStep('success');
      queryClient.invalidateQueries({ queryKey: ['team-member-payment-statuses', editionId] });
      queryClient.invalidateQueries({ queryKey: ['cash-flow', editionId] });
      queryClient.invalidateQueries({ queryKey: ['cash-summary', editionId] });
    },
    onError: (err: Error) => {
      alert(`Erro ao registrar pagamento: ${err.message}`);
    },
  });

  function handleSelectMember(member: TeamMemberOption) {
    setSelected(member);
    setAmountCents(Math.min(member.outstanding_cents, DEFAULT_AMOUNT_CENTS));
    setStep('form');
  }

  function handleRegisterAnother() {
    setStep('search');
    setSelected(null);
    setAmountCents(DEFAULT_AMOUNT_CENTS);
    setSearchQuery('');
  }

  const isLoading = isLoadingStatuses || isLoadingMembers;
  const canSubmit =
    step === 'form' &&
    selected !== null &&
    amountCents > 0 &&
    amountCents <= (selected?.outstanding_cents ?? DEFAULT_AMOUNT_CENTS);

  return {
    step,
    setStep,
    searchQuery,
    setSearchQuery,
    searchRef,
    selected,
    amountCents,
    setAmountCents,
    method,
    setMethod,
    payDate,
    setPayDate,
    notes,
    setNotes,
    successAmount,
    successOutstanding,
    isLoading,
    filtered,
    payMutation,
    canSubmit,
    handleSelectMember,
    handleRegisterAnother,
  };
}
