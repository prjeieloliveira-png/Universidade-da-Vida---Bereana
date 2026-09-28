import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Users, ShieldAlert, Tags, ChevronRight, Pencil, Trash2, ArrowDownAZ } from 'lucide-react';
import { useUserRole } from '@/shared/hooks/useUserRole';
import { sortByName } from '@/shared/utils/sortByName';
import { useUsers } from '../hooks/useUsers';
import { CreateUserModal } from '../components/CreateUserModal';
import { EditUserModal } from '../components/EditUserModal';
import { DeleteUserDialog } from '../components/DeleteUserDialog';
import type { AppUser } from '../types';

const ROLE_LABELS: Record<string, string> = {
  coordinator: 'Coordenação',
  secretary: 'Secretaria',
  network_leader: 'Líder de Rede',
  viewer: 'Colaborador',
};

export function SettingsPage() {
  const navigate = useNavigate();
  const { isCoordOrSec, isLoading: isLoadingRole, email: currentUserEmail } = useUserRole();
  const { users, isLoading, fetchError, createUser, updateUser, deleteUser } = useUsers();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AppUser | null>(null);
  const [sortAlphabetically, setSortAlphabetically] = useState(false);

  const displayedUsers = useMemo(
    () => (sortAlphabetically ? sortByName(users, (u) => u.full_name) : users),
    [users, sortAlphabetically]
  );

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
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSortAlphabetically((v) => !v)}
              className={`px-3.5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                sortAlphabetically
                  ? 'bg-[#163242] text-white border-[#163242]'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
              title={sortAlphabetically ? 'Ordenação alfabética ativada' : 'Ordenar usuários em ordem alfabética'}
              aria-pressed={sortAlphabetically}
            >
              <ArrowDownAZ className={`w-3.5 h-3.5 ${sortAlphabetically ? 'text-[#58bc75]' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">A-Z</span>
            </button>
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 rounded-full text-xs font-black bg-[#0d7647] hover:bg-[#095a36] active:bg-[#064227] text-white flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Novo Usuário</span>
            </button>
          </div>
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
            {displayedUsers.map((user) => {
              const isSelf = user.email === currentUserEmail;
              return (
                <div key={user.id} className="px-5 py-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {user.full_name}
                      {isSelf && <span className="text-slate-400 font-medium"> (você)</span>}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                      {ROLE_LABELS[user.role] ?? user.role}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingUser(user)}
                      className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                      title="Editar usuário"
                      aria-label={`Editar ${user.full_name}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {!isSelf && (
                      <button
                        type="button"
                        onClick={() => setDeletingUser(user)}
                        className="w-7 h-7 rounded-full bg-rose-50 hover:bg-rose-100 flex items-center justify-center text-rose-600 transition-colors cursor-pointer"
                        title="Excluir usuário"
                        aria-label={`Excluir ${user.full_name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CreateUserModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={createUser} />

      <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSuccess={updateUser} />

      {deletingUser && (
        <DeleteUserDialog
          user={deletingUser}
          onClose={() => setDeletingUser(null)}
          onConfirm={() => deleteUser(deletingUser.id)}
        />
      )}
    </div>
  );
}
