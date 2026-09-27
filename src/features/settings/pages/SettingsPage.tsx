import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Users, ShieldAlert, Tags, ChevronRight } from 'lucide-react';
import { useUserRole } from '@/shared/hooks/useUserRole';
import { useUsers } from '../hooks/useUsers';
import { CreateUserModal } from '../components/CreateUserModal';

const ROLE_LABELS: Record<string, string> = {
  coordinator: 'Coordenação',
  secretary: 'Secretaria',
  network_leader: 'Líder de Rede',
  viewer: 'Colaborador',
};

export function SettingsPage() {
  const navigate = useNavigate();
  const { isCoordOrSec, isLoading: isLoadingRole } = useUserRole();
  const { users, isLoading, fetchError, createUser } = useUsers();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  if (!isLoadingRole && !isCoordOrSec) {
    return (
      <div className="p-8 text-center bg-white rounded-[28px] border border-slate-200 text-slate-500 flex flex-col items-center gap-3">
        <ShieldAlert className="w-8 h-8 text-slate-300" />
        <p className="font-semibold text-slate-700">Acesso restrito</p>
        <p className="text-sm">Apenas coordenação ou secretaria pode acessar as configurações.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
          <span>Portal</span>
          <span>&gt;</span>
          <span className="text-slate-600 font-semibold">Configurações</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Configurações</h2>
        <p className="text-xs text-slate-500 mt-0.5">Usuários do sistema e preferências gerais</p>
      </div>

      {/* Atalho para categorias financeiras (já existente) */}
      <button
        type="button"
        onClick={() => navigate('/financeiro?config=categorias')}
        className="w-full flex items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs hover:border-slate-300 transition-all cursor-pointer text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <Tags className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Categorias Financeiras</h3>
            <p className="text-xs text-slate-400">Categorias de entrada e saída do caixa</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
      </button>

      {/* Usuários */}
      <div className="bg-white border border-slate-200/80 rounded-[28px] shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Users className="w-4.5 h-4.5 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900">Usuários ({users.length})</h3>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 rounded-full text-xs font-black bg-[#0d7647] hover:bg-[#095a36] active:bg-[#064227] text-white flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Novo Usuário</span>
          </button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Carregando usuários...</div>
        ) : fetchError ? (
          <div className="p-8 text-center text-rose-600 text-sm">
            Não foi possível carregar os usuários. Verifique a conexão.
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">Nenhum usuário cadastrado ainda.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {users.map((user) => (
              <div key={user.id} className="px-5 py-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{user.full_name}</p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 shrink-0">
                  {ROLE_LABELS[user.role] ?? user.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateUserModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={createUser} />
    </div>
  );
}
