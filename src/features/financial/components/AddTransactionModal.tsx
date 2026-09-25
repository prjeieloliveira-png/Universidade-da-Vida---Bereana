import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import type { CashCategory, CreateTransactionInput } from '../types';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'revenue' | 'expense';
  editionId: string;
  categories: CashCategory[];
  onSuccess: (input: CreateTransactionInput) => Promise<void>;
}

export function AddTransactionModal({
  isOpen,
  onClose,
  type,
  editionId,
  categories,
  onSuccess,
}: AddTransactionModalProps) {
  const isRevenue = type === 'revenue';
  const filteredCategories = categories.filter((c) => c.type === (isRevenue ? 'in' : 'out'));

  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [category, setCategory] = useState(filteredCategories[0]?.name || '');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cash' | 'debit' | 'credit'>('pix');
  const [transactionDate, setTransactionDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentCategory = category || filteredCategories[0]?.name || (isRevenue ? 'Inscrição' : 'Outras Saídas');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Converter valor digitado em centavos
    const cleanAmount = amountStr.replace(/\./g, '').replace(',', '.');
    const parsedNumber = parseFloat(cleanAmount);
    if (isNaN(parsedNumber) || parsedNumber <= 0) {
      setErrorMsg('Informe um valor válido maior que zero.');
      return;
    }

    const amountCents = Math.round(parsedNumber * 100);

    try {
      setIsSubmitting(true);
      await onSuccess({
        edition_id: editionId,
        type,
        category: currentCategory,
        amount_cents: amountCents,
        payment_method: paymentMethod,
        description: description.trim(),
        transaction_date: transactionDate,
      });
      // Limpar form e fechar
      setDescription('');
      setAmountStr('');
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Falha ao salvar lançamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-[28px] border border-slate-200/80 shadow-2xl max-w-lg w-full overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                isRevenue ? 'bg-emerald-50 text-[#0d7647]' : 'bg-rose-50 text-rose-600'
              }`}
            >
              {isRevenue ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                {isRevenue ? 'Nova Receita' : 'Nova Despesa'}
              </h3>
              <p className="text-xs text-slate-400">
                {isRevenue ? 'Lançamento manual de entrada' : 'Lançamento manual de gasto / saída'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Descrição */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Descrição do Lançamento
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isRevenue ? 'Ex: Doação de materiais, Oferta especial' : 'Ex: Aluguel do Sítio, Compra de Apostilas'}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d7647] focus:bg-white text-slate-900 transition-all"
            />
          </div>

          {/* Valor (R$) e Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Valor (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  R$
                </span>
                <input
                  type="text"
                  required
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d7647] focus:bg-white text-slate-900 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Data do Lançamento
              </label>
              <input
                type="date"
                required
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d7647] focus:bg-white text-slate-900 transition-all cursor-pointer"
              />
            </div>
          </div>

          {/* Categoria e Forma de Pagamento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Categoria
              </label>
              <select
                value={currentCategory}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d7647] focus:bg-white text-slate-800 font-medium cursor-pointer"
              >
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Forma de Pagamento
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as 'pix' | 'cash' | 'debit' | 'credit')}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d7647] focus:bg-white text-slate-800 font-medium cursor-pointer"
              >
                <option value="pix">PIX</option>
                <option value="cash">Dinheiro em Espécie</option>
                <option value="debit">Cartão de Débito</option>
                <option value="credit">Cartão de Crédito</option>
              </select>
            </div>
          </div>

          {/* Botões do Rodapé */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                isRevenue
                  ? 'bg-[#0d7647] hover:bg-[#095a36] active:bg-[#064227]'
                  : 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800'
              } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Salvando...' : isRevenue ? 'Salvar Receita' : 'Salvar Despesa'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
