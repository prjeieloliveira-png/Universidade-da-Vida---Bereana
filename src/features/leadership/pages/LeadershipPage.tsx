import { useState, useMemo } from 'react';
import { Search, Shield, Network, Users, Edit2, Trash2, UserCheck } from 'lucide-react';
import { useLeadershipStore } from '../store/leadershipStore';
import { LeadershipStatsBar } from '../components/LeadershipStatsBar';
import { LeadershipModal, LeadershipModalItem } from '../components/LeadershipModal';
import type { LeadershipRole } from '../types';

interface DisplayLeaderItem {
  id: string;
  name: string;
  role: LeadershipRole;
  roleLabel: string;
  phone?: string;
  pastorId?: string;
  pastorName?: string;
  g12Id?: string;
  g12Name?: string;
}

export function LeadershipPage() {
  const {
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
  } = useLeadershipStore();

  const [activeTab, setActiveTab] = useState<'ALL' | LeadershipRole>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPastorFilter, setSelectedPastorFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LeadershipModalItem | null>(null);

  // Combine items into a unified list
  const allItems: DisplayLeaderItem[] = useMemo(() => {
    const list: DisplayLeaderItem[] = [];

    pastors.forEach((p) => {
      list.push({
        id: p.id,
        name: p.name,
        role: 'PASTOR',
        roleLabel: 'Pastor',
        phone: p.phone,
      });
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
        roleLabel: 'Líder de Célula',
        g12Id: l.g12Id,
        g12Name: l.g12Name,
        pastorName: l.pastorName,
        phone: l.phone,
      });
    });

    return list;
  }, [pastors, g12s, leaders]);

  // Filtered list
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      // Tab filter
      if (activeTab !== 'ALL' && item.role !== activeTab) return false;

      // Pastor filter
      if (selectedPastorFilter !== 'ALL') {
        if (item.role === 'PASTOR' && item.name !== selectedPastorFilter) return false;
        if (item.role !== 'PASTOR' && item.pastorName !== selectedPastorFilter) return false;
      }

      // Search query
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
  }, [allItems, activeTab, selectedPastorFilter, searchQuery]);

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

  const handleDelete = (item: DisplayLeaderItem) => {
    if (!window.confirm(`Tem certeza que deseja excluir ${item.name}?`)) return;
    if (item.role === 'PASTOR') deletePastor(item.id);
    else if (item.role === 'G12') deleteG12(item.id);
    else if (item.role === 'LEADER') deleteLeader(item.id);
  };

  const handleSaveItem = (saved: LeadershipModalItem) => {
    if (!saved.id) {
      // Create
      if (saved.role === 'PASTOR') addPastor(saved.name, saved.phone);
      else if (saved.role === 'G12') addG12(saved.name, saved.pastorId!, saved.phone);
      else if (saved.role === 'LEADER') addLeader(saved.name, saved.g12Id!, saved.phone);
    } else {
      // Update
      if (saved.role === 'PASTOR') updatePastor(saved.id, saved.name, saved.phone);
      else if (saved.role === 'G12') updateG12(saved.id, saved.name, saved.pastorId!, saved.phone);
      else if (saved.role === 'LEADER') updateLeader(saved.id, saved.name, saved.g12Id!, saved.phone);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
          Pastores, Líderes G12 e Células que compõem as redes da Universidade da Vida
        </p>
      </div>

      {/* Stats Bar */}
      <LeadershipStatsBar
        pastorCount={pastors.length}
        g12Count={g12s.length}
        leaderCount={leaders.length}
        onOpenCreate={handleOpenCreate}
      />

      {/* Filters & Tabs */}
      <div className="bg-white border border-slate-200/80 rounded-[28px] p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome do líder, pastor ou G12..."
              className="w-full pl-11 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200/80 rounded-full focus:outline-none focus:ring-2 focus:ring-[#58bc75] focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Role Tabs */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {(
              [
                { key: 'ALL', label: `Todos (${allItems.length})` },
                { key: 'PASTOR', label: `Pastores (${pastors.length})` },
                { key: 'G12', label: `G12 (${g12s.length})` },
                { key: 'LEADER', label: `Células (${leaders.length})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  activeTab === tab.key
                    ? 'bg-[#163242] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pastor Coverage Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-bold flex items-center gap-1 shrink-0 uppercase text-[10px] tracking-wider">
            <UserCheck className="w-3.5 h-3.5" /> Filtrar Pastor:
          </span>
          <button
            onClick={() => setSelectedPastorFilter('ALL')}
            className={`px-3 py-1 rounded-full font-medium transition-all cursor-pointer shrink-0 ${
              selectedPastorFilter === 'ALL'
                ? 'bg-[#58bc75] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos
          </button>
          {pastors.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPastorFilter(p.name)}
              className={`px-3 py-1 rounded-full font-medium transition-all cursor-pointer shrink-0 ${
                selectedPastorFilter === p.name
                  ? 'bg-[#58bc75] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-2.5">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-[28px] border border-slate-200 text-slate-400 text-sm">
            Nenhum organizador encontrado com os filtros selecionados.
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={`${item.role}-${item.id}`}
              className="bg-white border border-slate-200/90 rounded-[22px] p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-all"
            >
              {/* Left Info */}
              <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold shrink-0 shadow-2xs ${
                    item.role === 'PASTOR'
                      ? 'bg-[#163242] text-white'
                      : item.role === 'G12'
                      ? 'bg-[#58bc75] text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {item.role === 'PASTOR' && <Shield className="w-4 h-4" />}
                  {item.role === 'G12' && <Network className="w-4 h-4" />}
                  {item.role === 'LEADER' && <Users className="w-4 h-4" />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm sm:text-base font-bold text-slate-800 truncate">
                      {item.name}
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        item.role === 'PASTOR'
                          ? 'bg-[#163242]/10 text-[#163242]'
                          : item.role === 'G12'
                          ? 'bg-[#58bc75]/15 text-[#20693a]'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.roleLabel}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                    {item.role === 'PASTOR' && 'Pastor Titular / Rede'}
                    {item.role === 'G12' && `Pastor: ${item.pastorName}`}
                    {item.role === 'LEADER' && `Rede G12: ${item.g12Name} • Pastor: ${item.pastorName}`}
                    {item.phone && ` • Tel: ${item.phone}`}
                  </p>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="w-8 h-8 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                  title="Excluir"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
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
