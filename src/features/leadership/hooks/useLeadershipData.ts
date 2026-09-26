import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchPastors,
  fetchG12Leaders,
  fetchCellLeaders,
  fetchLeadershipHierarchy,
  createPastor,
  updatePastor,
  deletePastor,
  createG12,
  updateG12,
  deleteG12,
  createCellLeader,
  updateCellLeader,
  deleteCellLeader,
  type HierarchyLeaderRow,
} from '../api/leadershipApi';
import { useLeadershipStore } from '../store/leadershipStore';
import { useEffect } from 'react';

export function useLeadershipData() {
  const queryClient = useQueryClient();
  const store = useLeadershipStore();

  const hierarchyQuery = useQuery<HierarchyLeaderRow[]>({
    queryKey: ['leadership-hierarchy'],
    queryFn: fetchLeadershipHierarchy,
    staleTime: 30_000,
  });

  const pastorsQuery = useQuery({
    queryKey: ['pastors'],
    queryFn: fetchPastors,
    staleTime: 30_000,
  });

  const g12Query = useQuery({
    queryKey: ['g12-leaders'],
    queryFn: fetchG12Leaders,
    staleTime: 30_000,
  });

  const leadersQuery = useQuery({
    queryKey: ['cell-leaders'],
    queryFn: fetchCellLeaders,
    staleTime: 30_000,
  });

  // Atualiza o store em memória e cache para compatibilidade com filtros
  useEffect(() => {
    if (pastorsQuery.data && g12Query.data && leadersQuery.data) {
      useLeadershipStore.setState({
        pastors: pastorsQuery.data,
        g12s: g12Query.data,
        leaders: leadersQuery.data,
      });
    }
  }, [pastorsQuery.data, g12Query.data, leadersQuery.data]);

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['leadership-hierarchy'] });
    queryClient.invalidateQueries({ queryKey: ['pastors'] });
    queryClient.invalidateQueries({ queryKey: ['g12-leaders'] });
    queryClient.invalidateQueries({ queryKey: ['cell-leaders'] });
  };

  const addPastorMutation = useMutation({
    mutationFn: ({ name, phone }: { name: string; phone?: string }) => createPastor(name, phone),
    onSuccess: invalidateAll,
  });

  const updatePastorMutation = useMutation({
    mutationFn: ({ id, name, phone }: { id: string; name: string; phone?: string }) =>
      updatePastor(id, name, phone),
    onSuccess: invalidateAll,
  });

  const deletePastorMutation = useMutation({
    mutationFn: (id: string) => deletePastor(id),
    onSuccess: invalidateAll,
  });

  const addG12Mutation = useMutation({
    mutationFn: ({ pastorId, name, phone }: { pastorId: string; name: string; phone?: string }) =>
      createG12(pastorId, name, phone),
    onSuccess: invalidateAll,
  });

  const updateG12Mutation = useMutation({
    mutationFn: ({ id, pastorId, name, phone }: { id: string; pastorId: string; name: string; phone?: string }) =>
      updateG12(id, name, pastorId, phone),
    onSuccess: invalidateAll,
  });

  const deleteG12Mutation = useMutation({
    mutationFn: (id: string) => deleteG12(id),
    onSuccess: invalidateAll,
  });

  const addLeaderMutation = useMutation({
    mutationFn: ({ g12Id, name, phone }: { g12Id: string; name: string; phone?: string }) =>
      createCellLeader(g12Id, name, phone),
    onSuccess: invalidateAll,
  });

  const updateLeaderMutation = useMutation({
    mutationFn: ({ id, g12Id, name, phone }: { id: string; g12Id: string; name: string; phone?: string }) =>
      updateCellLeader(id, name, g12Id, phone),
    onSuccess: invalidateAll,
  });

  const deleteLeaderMutation = useMutation({
    mutationFn: (id: string) => deleteCellLeader(id),
    onSuccess: invalidateAll,
  });

  return {
    isLoading: hierarchyQuery.isLoading,
    isError: hierarchyQuery.isError,
    hierarchyItems: hierarchyQuery.data ?? [],
    pastors: pastorsQuery.data ?? store.pastors,
    g12s: g12Query.data ?? store.g12s,
    leaders: leadersQuery.data ?? store.leaders,
    addPastor: addPastorMutation.mutateAsync,
    updatePastor: updatePastorMutation.mutateAsync,
    deletePastor: deletePastorMutation.mutateAsync,
    addG12: addG12Mutation.mutateAsync,
    updateG12: updateG12Mutation.mutateAsync,
    deleteG12: deleteG12Mutation.mutateAsync,
    addLeader: addLeaderMutation.mutateAsync,
    updateLeader: updateLeaderMutation.mutateAsync,
    deleteLeader: deleteLeaderMutation.mutateAsync,
    refetch: invalidateAll,
  };
}
