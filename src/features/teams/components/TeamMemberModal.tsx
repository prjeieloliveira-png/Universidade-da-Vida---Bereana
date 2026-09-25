import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { maskPhone, unmaskPhone, isValidBrazilianPhone } from '@/shared/utils/phone';
import { usePersonLookup } from '../hooks/usePersonLookup';
import { PersonSuggestionBanner } from './PersonSuggestionBanner';
import type {
  TeamRoleRow,
  TeamMemberWithDetails,
  CreateTeamMemberInput,
  UpdateTeamMemberInput,
} from '../types/teams';

interface TeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  roles: TeamRoleRow[];
  initialMember?: TeamMemberWithDetails | null;
  defaultRoleId?: string;
  onSaveCreate: (input: CreateTeamMemberInput) => Promise<unknown>;
  onSaveUpdate: (input: UpdateTeamMemberInput) => Promise<unknown>;
}

export const TeamMemberModal: React.FC<TeamMemberModalProps> = ({
  isOpen,
  onClose,
  roles,
  initialMember,
  defaultRoleId,
  onSaveCreate,
  onSaveUpdate,
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [teamRoleId, setTeamRoleId] = useState('');
  const [notes, setNotes] = useState('');
  const [personId, setPersonId] = useState<string | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { matchedPerson, isSearchingPhone, clearMatchedPerson } = usePersonLookup(
    phone,
    !initialMember && isOpen
  );

  useEffect(() => {
    if (!isOpen) return;

    if (initialMember) {
      setFullName(initialMember.person.fullName);
      setPhone(maskPhone(initialMember.person.phone));
      setTeamRoleId(initialMember.teamRoleId);
      setNotes(initialMember.notes || '');
      setPersonId(initialMember.personId);
    } else {
      setFullName('');
      setPhone('');
      setTeamRoleId(defaultRoleId || roles[0]?.id || '');
      setNotes('');
      setPersonId(undefined);
    }
    setErrorMsg(null);
  }, [isOpen, initialMember, defaultRoleId, roles]);

  if (!isOpen) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(maskPhone(e.target.value));
  };

  const handleApplyMatchedPerson = () => {
    if (matchedPerson) {
      setFullName(matchedPerson.full_name);
      setPersonId(matchedPerson.id);
      clearMatchedPerson();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = fullName.trim();
    if (!trimmedName) {
      setErrorMsg('O nome do membro é obrigatório.');
      return;
    }

    if (!isValidBrazilianPhone(phone)) {
      setErrorMsg('Informe um telefone brasileiro válido com DDD (10 ou 11 dígitos).');
      return;
    }

    if (!teamRoleId) {
      setErrorMsg('Selecione uma equipe.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        fullName: trimmedName,
        phone: unmaskPhone(phone),
        teamRoleId,
        notes: notes.trim() || undefined,
      };
      if (initialMember) {
        await onSaveUpdate({ ...payload, id: initialMember.id });
      } else {
        await onSaveCreate({ ...payload, personId });
      }
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao salvar membro');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-[32px] border border-slate-200/90 shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[92vh]">
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              {initialMember ? 'Editar Membro' : 'Novo Membro da Equipe'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Preencha os dados do integrante para a equipe de serviço
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Telefone primeiro para sugestão inteligente */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="member-phone">
              Telefone (WhatsApp) *
            </label>
            <div className="relative">
              <input
                id="member-phone"
                type="tel"
                required
                value={phone}
                onChange={handlePhoneChange}
                placeholder="(11) 98765-4321"
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#58bc75] focus:bg-white transition-all font-mono"
              />
              {isSearchingPhone && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                </div>
              )}
            </div>

            {/* Banner de sugestão inteligente quando o telefone já existe em people */}
            {matchedPerson && (
              <PersonSuggestionBanner
                fullName={matchedPerson.full_name}
                onApply={handleApplyMatchedPerson}
              />
            )}
          </div>

          {/* Nome */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="member-name">
              Nome Completo *
            </label>
            <input
              id="member-name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ex.: João da Silva"
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#58bc75] focus:bg-white transition-all"
            />
          </div>

          {/* Equipe / Cargo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="member-role">
              Equipe / Função *
            </label>
            <select
              id="member-role"
              required
              value={teamRoleId}
              onChange={(e) => setTeamRoleId(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#58bc75] focus:bg-white transition-all"
            >
              {roles.length === 0 ? (
                <option value="" disabled>
                  Carregando equipes...
                </option>
              ) : (
                roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.sort_order}. {r.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="member-notes">
              Observações (opcional)
            </label>
            <textarea
              id="member-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex.: Casal com Maria, responsável pelos crachás..."
              className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#58bc75] focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 min-h-[44px] rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 min-h-[44px] rounded-full text-xs font-bold bg-[#58bc75] hover:bg-[#4caa68] active:bg-[#419a5c] disabled:opacity-60 text-white transition-colors shadow-sm cursor-pointer inline-flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{initialMember ? 'Salvar Alterações' : 'Cadastrar Membro'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
