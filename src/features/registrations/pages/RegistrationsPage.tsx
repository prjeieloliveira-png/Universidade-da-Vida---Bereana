import { useState, useMemo } from 'react';
import { useStudentStore } from '../store/studentStore';
import { useCohortStore } from '@/features/cohorts/store/cohortStore';
import { StudentCard } from '../components/StudentCard';
import { RegistrationEditModal } from '../components/RegistrationEditModal';
import { HierarchicalLeaderFilter } from '../components/HierarchicalLeaderFilter';
import { StudentRecord } from '../types';
import { Search, UserPlus, Users } from 'lucide-react';

export function RegistrationsPage() {
  const { activeCohortId, getActiveCohort } = useCohortStore();
  const activeCohort = getActiveCohort();

  const {
    students,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    updateStudent,
    addStudent,
  } = useStudentStore();

  const cohortStudents = useMemo(() => {
    return students.filter((s) => (s.cohortId || 'turma-01') === activeCohortId);
  }, [students, activeCohortId]);

  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Hierarchical filter state: Pastor -> G12 -> Cell Leader
  const [selectedPastor, setSelectedPastor] = useState<string>('ALL');
  const [selectedG12, setSelectedG12] = useState<string>('ALL');
  const [selectedLeader, setSelectedLeader] = useState<string>('ALL');

  // Filter logic
  const filteredStudents = useMemo(() => {
    return cohortStudents.filter((s) => {
      // 1. Text Search filter
      const matchesSearch =
        searchQuery.trim() === '' ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.pastor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.g12.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.leader.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Status filter
      const matchesStatus = filterStatus === 'ALL' || s.status === filterStatus;

      // 3. Hierarchical leadership filters
      const matchesPastor = selectedPastor === 'ALL' || s.pastor === selectedPastor;
      const matchesG12 = selectedG12 === 'ALL' || s.g12 === selectedG12;
      const matchesLeader = selectedLeader === 'ALL' || s.leader === selectedLeader;

      return matchesSearch && matchesStatus && matchesPastor && matchesG12 && matchesLeader;
    });
  }, [cohortStudents, searchQuery, filterStatus, selectedPastor, selectedG12, selectedLeader]);

  const paidCount = useMemo(() => cohortStudents.filter((s) => s.status === 'Pago').length, [cohortStudents]);
  const pendingCount = useMemo(
    () => cohortStudents.filter((s) => s.status === 'Pendente').length,
    [cohortStudents]
  );

  const handleOpenEdit = (student: StudentRecord) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    const blankStudent: StudentRecord = {
      id: '',
      cohortId: activeCohortId,
      personId: '',
      num: students.length + 1,
      name: '',
      gender: 'Feminino',
      birthDate: '2000-01-01',
      age: 26,
      maritalStatus: 'Solteiro',
      phone: '',
      address: '',
      shirtSize: '—',
      pastor: selectedPastor !== 'ALL' ? selectedPastor : 'Pra. Socorro Paiva',
      g12: selectedG12 !== 'ALL' ? selectedG12 : '',
      leader: selectedLeader !== 'ALL' ? selectedLeader : '',
      status: 'Pendente',
      paymentMethod: '—',
      amountCents: activeCohort.registrationFeeCents || 20000,
      comorbidity: 'Não',
      medSchedule: 'Não',
      s1: false, s2: false, s3: false, s4: false, s5: false, s6: false, s7: false, s8: false, s9: false,
    };

    setEditingStudent(blankStudent);
    setIsModalOpen(true);
  };

  const handleSaveStudent = (s: StudentRecord) => (!s.id ? addStudent(s) : updateStudent(s));
  const handleResetHierarchy = () => {
    setSelectedPastor('ALL'); setSelectedG12('ALL'); setSelectedLeader('ALL');
  };

  return (
    <div className="space-y-6">
      {/* Header & Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
            <span>Portal</span>
            <span>&gt;</span>
            <span className="text-slate-600 font-semibold">Inscrições</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Lista de Alunos ({cohortStudents.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerenciamento de alunos e inscrições da {activeCohort.name}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Universidade da Vida 2026 • 53 Participantes Cadastrados
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-[#58bc75] hover:bg-[#4caa68] active:bg-[#419a5c] text-white transition-colors shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Novo Aluno</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200/80 rounded-[28px] p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome, celular, pastor ou líder..."
              className="w-full pl-11 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200/80 rounded-full focus:outline-none focus:ring-2 focus:ring-[#58bc75] focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                filterStatus === 'ALL'
                  ? 'bg-[#163242] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({cohortStudents.length})
            </button>
            <button
              onClick={() => setFilterStatus('Pago')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                filterStatus === 'Pago'
                  ? 'bg-[#58bc75] text-white shadow-xs'
                  : 'bg-[#e8f8ee] text-[#2c814b] hover:bg-[#d6f4df]'
              }`}
            >
              Pagos ({paidCount})
            </button>
            <button
              onClick={() => setFilterStatus('Pendente')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                filterStatus === 'Pendente'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              Pendentes ({pendingCount})
            </button>
          </div>
        </div>

        {/* Hierarchical Cascading Leader Filter: Pastor -> G12 -> Leader */}
        <HierarchicalLeaderFilter
          students={cohortStudents}
          selectedPastor={selectedPastor}
          selectedG12={selectedG12}
          selectedLeader={selectedLeader}
          onSelectPastor={setSelectedPastor}
          onSelectG12={setSelectedG12}
          onSelectLeader={setSelectedLeader}
          onResetHierarchy={handleResetHierarchy}
        />
      </div>

      {/* Result Count Status */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-500 font-medium">
        <span>
          Exibindo <strong>{filteredStudents.length}</strong> de {cohortStudents.length} alunos na {activeCohort.name}
        </span>
        {(selectedPastor !== 'ALL' || selectedG12 !== 'ALL' || selectedLeader !== 'ALL') && (
          <span className="text-[#2e844b] font-semibold">
            Filtro: {selectedPastor}
            {selectedG12 !== 'ALL' && ` › ${selectedG12}`}
            {selectedLeader !== 'ALL' && ` › ${selectedLeader}`}
          </span>
        )}
      </div>

      {/* Cards List */}
      <div className="space-y-3">
        {cohortStudents.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-[28px] border border-slate-200 text-slate-500 space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#58bc75]/15 text-[#20693a] flex items-center justify-center mx-auto">
              <Users className="w-5 h-5" />
            </div>
            <div className="font-bold text-slate-800 text-sm">Nenhum aluno inscrito na {activeCohort.name}</div>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Turma iniciada do zero. Clique em "Novo Aluno" para cadastrar a primeira inscrição.
            </p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-[28px] border border-slate-200 text-slate-400">
            Nenhum aluno encontrado para os filtros selecionados.
          </div>
        ) : (
          filteredStudents.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onEdit={handleOpenEdit}
            />
          ))
        )}
      </div>

      {/* Edit Modal */}
      <RegistrationEditModal
        student={editingStudent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveStudent}
      />
    </div>
  );
}
