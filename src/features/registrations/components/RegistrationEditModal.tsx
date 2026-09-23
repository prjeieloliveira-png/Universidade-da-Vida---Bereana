import React, { useState } from 'react';
import { X, Save, CheckCircle2 } from 'lucide-react';
import type { StudentRecord } from '../types';
import { RegistrationLeadershipFields } from './RegistrationLeadershipFields';
import { RegistrationHealthAndAttendanceFields } from './RegistrationHealthAndAttendanceFields';
import { PhotoUpload } from './PhotoUpload';

interface RegistrationEditModalProps {
  student: StudentRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (saved: StudentRecord) => void;
}

export function RegistrationEditModal({
  student,
  isOpen,
  onClose,
  onSave,
}: RegistrationEditModalProps) {
  if (!isOpen || !student) return null;

  const [formData, setFormData] = useState<StudentRecord>({ ...student });
  const [successNotice, setSuccessNotice] = useState(false);

  const handleChange = (field: keyof StudentRecord, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSuccessNotice(true);
    setTimeout(() => {
      setSuccessNotice(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-400">
              {formData.num ? `Aluno #${formData.num}` : 'Novo Cadastro'}
            </span>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              {formData.name || 'Ficha Cadastral'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {successNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Dados atualizados com sucesso!</span>
            </div>
          )}

          {/* Foto de Perfil */}
          <div className="flex justify-center sm:justify-start">
            <PhotoUpload
              personId={formData.personId}
              currentUrl={formData.photoUrl}
              gender={formData.gender}
              onUploaded={(url) => handleChange('photoUrl', url || undefined)}
            />
          </div>

          {/* Grupo 1: Dados Pessoais */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              1. Dados Pessoais
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#58bc75] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sexo</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#58bc75] focus:outline-none"
                >
                  <option value="Feminino">Feminino</option>
                  <option value="Masculino">Masculino</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  required
                  value={formData.birthDate}
                  onChange={(e) => handleChange('birthDate', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#58bc75] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estado Civil
                </label>
                <select
                  value={formData.maritalStatus}
                  onChange={(e) => handleChange('maritalStatus', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#58bc75] focus:outline-none"
                >
                  <option value="Solteiro">Solteiro</option>
                  <option value="Casado">Casado</option>
                  <option value="Divorciado">Divorciado</option>
                  <option value="Viúvo">Viúvo</option>
                  <option value="União Estável">União Estável</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Celular</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="(86) 99999-0000"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#58bc75] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Endereço
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Rua, Número - Bairro - Cidade"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#58bc75] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Grupo 2: Inscrição & Liderança */}
          <RegistrationLeadershipFields
            shirtSize={formData.shirtSize}
            pastor={formData.pastor}
            g12={formData.g12}
            leader={formData.leader}
            onChange={(updates) => setFormData((prev) => ({ ...prev, ...updates }))}
          />

          {/* Grupo 3: Pagamento */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              3. Financeiro
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status do Pagamento
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    handleChange('status', e.target.value as 'Pago' | 'Pendente')
                  }
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#58bc75] focus:outline-none"
                >
                  <option value="Pago">Pago</option>
                  <option value="Pendente">Pendente</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Forma de Pagamento
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) =>
                    handleChange(
                      'paymentMethod',
                      e.target.value as 'PIX' | 'CARTÃO' | 'DINHEIRO' | '—'
                    )
                  }
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#58bc75] focus:outline-none"
                >
                  <option value="—">—</option>
                  <option value="PIX">PIX</option>
                  <option value="CARTÃO">CARTÃO</option>
                  <option value="DINHEIRO">DINHEIRO</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grupos 4 e 5: Saúde & Frequência (9 Semanas) */}
          <RegistrationHealthAndAttendanceFields
            comorbidity={formData.comorbidity}
            medSchedule={formData.medSchedule}
            s1={formData.s1}
            s2={formData.s2}
            s3={formData.s3}
            s4={formData.s4}
            s5={formData.s5}
            s6={formData.s6}
            s7={formData.s7}
            s8={formData.s8}
            s9={formData.s9}
            onChange={handleChange}
          />


          {/* Footer Actions */}
          <div className="pt-5 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#58bc75] hover:bg-[#4caa68] active:bg-[#429c5d] flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
