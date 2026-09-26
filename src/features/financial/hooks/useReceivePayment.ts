import { useState, useMemo, useRef, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { registerPayment, fetchRegistrationPaymentStatuses } from '../data/financialData';
import type { PaymentMethodKey } from '../types';
import { supabase } from '@/shared/lib/supabase';
import { formatCentsToBRL } from '@/shared/utils/currency';
import { buildPaymentSuccessMessage, buildWhatsAppUrl } from '../components/paymentReceiptShared';
import type { PersonOption } from '../components/ReceivePaymentModal';

type Step = 'search' | 'form' | 'success';

/** Estado, dados e ações do fluxo de recebimento de pagamento de um inscrito. */
export function useReceivePayment(isOpen: boolean, editionId: string, onClose: () => void) {
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>('search');
  const [selected, setSelected] = useState<PersonOption | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const [amountInput, setAmountInput] = useState('');
  const [amountCents, setAmountCents] = useState(0);
  const [method, setMethod] = useState<PaymentMethodKey>('pix');
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [amountError, setAmountError] = useState('');

  const [paidAmount, setPaidAmount] = useState(0);
  const [outstandingAfter, setOutstandingAfter] = useState(0);

  useEffect(() => {
    if (isOpen && step === 'search') {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [isOpen, step]);

  function handleClose() {
    setStep('search');
    setSelected(null);
    setSearchQuery('');
    setAmountInput('');
    setAmountCents(0);
    setMethod('pix');
    setPayDate(new Date().toISOString().slice(0, 10));
    setNotes('');
    setAmountError('');
    onClose();
  }

  const { data: statuses, isLoading: loadingStatuses } = useQuery({
    queryKey: ['reg-payment-statuses', editionId],
    queryFn: () => fetchRegistrationPaymentStatuses(editionId),
    enabled: isOpen,
    staleTime: 30_000,
  });

  const { data: people, isLoading: loadingPeople } = useQuery({
    queryKey: ['people-for-receive-payment', editionId],
    queryFn: async () => {
      if (!statuses || statuses.length === 0) return [];
      const personIds = statuses.map((s) => s.person_id);

      const { data } = await supabase
        .from('people')
        .select('id, full_name, phone')
        .in('id', personIds);

      return (data ?? []).map((p) => {
        const st = statuses.find((s) => s.person_id === p.id);
        const row = p as { id: string; full_name: string; phone?: string | null };
        return {
          registration_id: st?.registration_id ?? '',
          person_id: p.id,
          full_name: p.full_name ?? '',
          phone: row.phone ?? '',
          outstanding_cents: st?.outstanding_cents ?? 0,
          registration_fee_cents: st?.registration_fee_cents ?? 0,
          total_paid_cents: st?.total_paid_cents ?? 0,
          status: st?.status ?? 'pending',
        } as PersonOption;
      });
    },
    enabled: isOpen && !!statuses && statuses.length > 0,
    staleTime: 30_000,
  });

  const filtered = useMemo(() => {
    if (!people) return [];
    const q = searchQuery.toLowerCase().trim();
    return people
      .filter((p) => !q || p.full_name.toLowerCase().includes(q))
      .sort((a, b) => b.outstanding_cents - a.outstanding_cents);
  }, [people, searchQuery]);

  const mutation = useMutation({
    mutationFn: () =>
      registerPayment({
        reg_id: selected!.registration_id,
        amt: amountCents,
        meth: method,
        pay_date: payDate,
        pay_notes: notes || undefined,
      }),
    onSuccess: () => {
      const after = Math.max(0, (selected?.outstanding_cents ?? 0) - amountCents);
      setPaidAmount(amountCents);
      setOutstandingAfter(after);
      setStep('success');

      void queryClient.invalidateQueries({ queryKey: ['cash-flow', editionId] });
      void queryClient.invalidateQueries({ queryKey: ['cash-summary', editionId] });
      void queryClient.invalidateQueries({ queryKey: ['reg-payment-statuses', editionId] });
      void queryClient.invalidateQueries({ queryKey: ['people-for-receive-payment', editionId] });
      void queryClient.invalidateQueries({ queryKey: ['registrations'] });
      void queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });

  function handleAmountChange(val: string) {
    setAmountInput(val);
    setAmountError('');
    const cents = Math.round(parseFloat(val) * 100);
    if (!isNaN(cents) && cents > 0) setAmountCents(cents);
    else setAmountCents(0);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    if (amountCents <= 0) {
      setAmountError('Informe um valor válido.');
      return;
    }
    if (amountCents > selected.outstanding_cents) {
      setAmountError(`Valor excede o saldo devedor (${formatCentsToBRL(selected.outstanding_cents)}).`);
      return;
    }
    mutation.mutate();
  }

  function handleSelectPerson(person: PersonOption) {
    setSelected(person);
    setAmountInput('');
    setAmountCents(0);
    setStep('form');
  }

  function handleSendWhatsApp() {
    if (!selected) return;
    const message = buildPaymentSuccessMessage(
      selected.full_name,
      paidAmount,
      outstandingAfter,
      'Inscrição quitada'
    );
    window.open(buildWhatsAppUrl(selected.phone, message), '_blank');
  }

  function handleReceiveAnother() {
    setStep('search');
    setSelected(null);
    setSearchQuery('');
    setAmountInput('');
    setAmountCents(0);
  }

  return {
    step,
    selected,
    searchQuery,
    setSearchQuery,
    searchRef,
    amountInput,
    amountCents,
    amountError,
    method,
    setMethod,
    payDate,
    setPayDate,
    notes,
    setNotes,
    paidAmount,
    outstandingAfter,
    isLoading: loadingStatuses || loadingPeople,
    filtered,
    mutation,
    handleClose,
    handleAmountChange,
    handleSubmit,
    handleSelectPerson,
    handleSendWhatsApp,
    handleReceiveAnother,
    setStep,
  };
}
