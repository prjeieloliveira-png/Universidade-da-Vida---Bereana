import { useState, useMemo } from 'react';
import { X, Calendar, Target } from 'lucide-react';
import { useCohortStore } from '../store/cohortStore';
import { useLeadershipStore } from '@/features/leadership/store/leadershipStore';
import { CohortLeaderList } from './CohortLeaderList';

interface NewCohortModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewCohortModal({ isOpen, onClose }: NewCohortModalProps) {
  const { createCohort } = useCohortStore();
  const { pastors, g12s, leaders } = useLeadershipStore();

  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]!);
  const [encounterDate, setEncounterDate] = useState('');
  const [targetStudents, setTargetStudents] = useState(70);
  const [registrationFee, setRegistrationFee] = useState(200);

  const allLeaderIds = useMemo(() => {
    return [
      ...pastors.map((p) => p.id),
      ...g12s.map((g) => g.id),
      ...leaders.map((l) => l.id),
    ];
  }, [pastors, g12s, leaders]);

  const [selectedLeaderIds, setSelectedLeaderIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleToggleLeader = (id: string) => {
    setSelectedLeaderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (selectedLeaderIds.length === 0) {
      setSelectedLeaderIds(allLeaderIds);
    }
    setStep(2);
  };

  const handleSave = () => {
    createCohort({
      name: name.trim(),
      startDate,
      encounterDate: encounterDate || undefined,
      targetStudents: Number(targetStudents) || 70,
      registrationFeeCents: (Number(registrationFee) || 200) * 100,
      activeLeaderIds: selectedLeaderIds,
    });

    onClose();
    setStep(1);
    setName('');
    setSelectedLeaderIds([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200/90 rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#58bc75]/15 text-[#20693a]">
                Passo {step} de 2
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                {step === 1 ? 'Cadastrar Nova Turma' : 'Selecionar Liderança da Turma'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {step === 1
                ? 'Defina o nome, datas e metas para iniciar do zero.'
                : 'Selecione quem da liderança geral vai atuar nesta turma.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step 1: Info Form */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nome da Turma *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Turma 02 - 2026.2 ou Turma Sábado"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#58bc75] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Data de Início *
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#58bc75] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Data do Encontro
                </label>
                <input
                  type="date"
                  value={encounterDate}
                  onChange={(e) => setEncounterDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#58bc75] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-slate-400" /> Meta de Alunos
                </label>
                <input
                  type="number"
                  min="1"
                  value={targetStudents}
                  onChange={(e) => setTargetStudents(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#58bc75] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Valor da Inscrição (R$)
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={registrationFee}
                  onChange={(e) => setRegistrationFee(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#58bc75] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="px-5 py-2 text-xs font-bold bg-[#58bc75] hover:bg-[#4caa68] disabled:opacity-50 text-white rounded-full transition-all shadow-xs cursor-pointer"
              >
                Avançar para Líderes &rarr;
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Leader Selection */}
        {step === 2 && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Action Bar */}
            <div className="px-5 sm:px-6 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedLeaderIds(allLeaderIds)}
                  className="text-[#20693a] font-bold hover:underline cursor-pointer"
                >
                  Marcar Todos ({allLeaderIds.length})
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={() => setSelectedLeaderIds([])}
                  className="text-slate-500 hover:underline cursor-pointer"
                >
                  Desmarcar
                </button>
              </div>
              <span className="text-[11px] font-bold text-slate-600">
                {selectedLeaderIds.length} selecionado(s)
              </span>
            </div>

            <CohortLeaderList
              pastors={pastors}
              g12s={g12s}
              leaders={leaders}
              selectedLeaderIds={selectedLeaderIds}
              onToggleLeader={handleToggleLeader}
            />

            {/* Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
              >
                &larr; Voltar
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2 text-xs font-bold bg-[#58bc75] hover:bg-[#4caa68] text-white rounded-full transition-all shadow-xs cursor-pointer active:scale-95"
              >
                Criar Turma
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
