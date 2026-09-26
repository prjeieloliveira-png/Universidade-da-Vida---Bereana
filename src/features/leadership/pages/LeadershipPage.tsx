import { useState, useMemo } from 'react';
import { useLeadershipData } from '../hooks/useLeadershipData';
import { useCohortStore } from '@/features/cohorts/store/cohortStore';
import { LeadershipStatsBar } from '../components/LeadershipStatsBar';
import { LeadershipFilterBar } from '../components/LeadershipFilterBar';
import { LeadershipModal, LeadershipModalItem } from '../components/LeadershipModal';
import { LeadershipItemCard } from '../components/LeadershipItemCard';
import { CloudCheck, Loader2 } from 'lucide-react';

export interface DisplayLeaderItem {
  id: string;
  name: string;
  role: 'PASTOR' | 'G12' | 'LEADER';
  roleLabel: string;
  phone?: string;
  pastorId?: string;
  pastorName?: string;
  g12Id?: string;
  g12Name?: string;
}

export function LeadershipPage() {
  const {
    isLoading,
    pastors,
    g12s,
    leaders,
    addPastor,
    updatePastor,
    deletePastor,
    addG12,
    updateG12,
    deleteG12,
    addLeader,
    updateLeader,
    deleteLeader,
  } = useLeadershipData();

  const { getActiveCohort, toggleLeaderInCohort } = useCohortStore();
  const activeCohort = getActiveCohort();

  const [activeTab, setActiveTab] = useState<'ALL' | 'PASTOR' | 'G12' | 'LEADER'>('ALL');
  const [cohortFilter, setCohortFilter] = useState<'ALL' | 'COHORT_ONLY'>('ALL');
  const [selectedPastorFilter, setSelectedPastorFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState<LeadershipModalItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isItemActiveInCohort = (itemId: string) => {
    if (!activeCohort.activeLeaderIds || activeCohort.activeLeaderIds.length === 0) {
      return true;
    }
    return activeCohort.activeLeaderIds.includes(itemId);
  };

  const allItems = useMemo(() => {
    const list: DisplayLeaderItem[] = [];

    pastors.forEach((p) => {
      list.push({ id: p.id, name: p.name, role: 'PASTOR', roleLabel: 'Pastor', phone: p.phone });
    });

    g12s.forEach((g) => {
      list.push({
        id: g.id,
        name: g.name,
        role: 'G12',
        roleLabel: 'Líder G12',
        pastorId: g.pastorId,
        pastorName: g.pastorName,
        phone: g.phone,
      });
    });

    leaders.forEach((l) => {
      list.push({
        id: l.id,
        name: l.name,
        role: 'LEADER',
        roleLabel: 'Líder',
        g12Id: l.g12Id,
        g12Name: l.g12Name,
        pastorName: l.pastorName,
        phone: l.phone,
      });
    });

    return list;
  }, [pastors, g12s, leaders]);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      if (cohortFilter === 'COHORT_ONLY' && !isItemActiveInCohort(item.id)) return false;
      if (activeTab !== 'ALL' && item.role !== activeTab) return false;

      if (selectedPastorFilter !== 'ALL') {
        if (item.role === 'PASTOR' && item.name !== selectedPastorFilter) return false;
        if (item.role !== 'PASTOR' && item.pastorName !== selectedPastorFilter) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesPastor = item.pastorName?.toLowerCase().includes(q) ?? false;
        const matchesG12 = item.g12Name?.toLowerCase().includes(q) ?? false;
        const matchesPhone = item.phone?.toLowerCase().includes(q) ?? false;
        return matchesName || matchesPastor || matchesG12 || matchesPhone;
      }

      return true;
    });
  }, [allItems, activeTab, cohortFilter, selectedPastorFilter, searchQuery, activeCohort]);

  const cohortActiveCount = useMemo(() => {
    return allItems.filter((i) => isItemActiveInCohort(i.id)).length;
  }, [allItems, activeCohort]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: DisplayLeaderItem) => {
    setEditingItem({
      id: item.id,
      role: item.role,
      name: item.name,
      phone: item.phone,
      pastorId: item.pastorId,
      g12Id: item.g12Id,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (item: DisplayLeaderItem) => {
    if (!window.confirm(`Tem certeza que deseja excluir ${item.name}?`)) return;
    try {
      if (item.role === 'PASTOR') await deletePastor(item.id);
      else if (item.role === 'G12') await deleteG12(item.id);
      else if (item.role === 'LEADER') await deleteLeader(item.id);
    } catch (err) {
      console.error('Erro ao excluir líder:', err);
      alert('Não foi possível excluir o líder. Verifique vínculos existentes.');
    }
  };

  const handleSaveItem = async (saved: LeadershipModalItem) => {
    try {
      if (!saved.id) {
        if (saved.role === 'PASTOR') await addPastor({ name: saved.name, phone: saved.phone });
        else if (saved.role === 'G12') await addG12({ pastorId: saved.pastorId!, name: saved.name, phone: saved.phone });
        else if (saved.role === 'LEADER') await addLeader({ g12Id: saved.g12Id!, name: saved.name, phone: saved.phone });
      } else {
        if (saved.role === 'PASTOR') await updatePastor({ id: saved.id, name: saved.name, phone: saved.phone });
        else if (saved.role === 'G12') await updateG12({ id: saved.id, pastorId: saved.pastorId!, name: saved.name, phone: saved.phone });
        else if (saved.role === 'LEADER') await updateLeader({ id: saved.id, g12Id: saved.g12Id!, name: saved.name, phone: saved.phone });
      }
    } catch (err) {
      console.error('Erro ao salvar líder no Supabase:', err);
      alert('Erro ao salvar no banco de dados.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
            <span>Portal</span>
            <span>&gt;</span>
            <span className="text-slate-600 font-semibold">Liderança</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Gestão de Lideranças & Organizadores
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Catálogo geral da igreja com escalação para a <strong>{activeCohort.name}</strong>
          </p>
        </div>

        {/* Supabase Status Indicator */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isLoading ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200/80">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
              <span>Carregando...</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
              <CloudCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Nuvem Sincronizada</span>
            </div>
          )}
        </div>
      </div>

      <LeadershipStatsBar
        pastorCount={pastors.length}
        g12Count={g12s.length}
        leaderCount={leaders.length}
        onOpenCreate={handleOpenCreate}
      />

      <LeadershipFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        cohortFilter={cohortFilter}
        onCohortFilterChange={setCohortFilter}
        selectedPastorFilter={selectedPastorFilter}
        onPastorFilterChange={setSelectedPastorFilter}
        pastors={pastors}
        activeCohortName={activeCohort.name}
        counts={{
          total: allItems.length,
          pastors: pastors.length,
          g12s: g12s.length,
          leaders: leaders.length,
          cohortActive: cohortActiveCount,
        }}
      />

      {/* Cards List */}
      <div className="space-y-2.5">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-[28px] border border-slate-200 text-slate-400 text-sm">
            Nenhum organizador encontrado com os filtros selecionados.
          </div>
        ) : (
          filteredItems.map((item) => (
            <LeadershipItemCard
              key={`${item.role}-${item.id}`}
              item={item}
              isActiveInCohort={isItemActiveInCohort(item.id)}
              onToggleCohortActive={() => toggleLeaderInCohort(activeCohort.id, item.id)}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      <LeadershipModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveItem}
        initialItem={editingItem}
        pastors={pastors}
        g12s={g12s}
      />
    </div>
  );
}
