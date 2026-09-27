import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createUser, deleteUser, fetchUsers, updateUser } from '../api/usersApi';
import type { CreateUserInput, UpdateUserInput } from '../types';

export function useUsers() {
  const queryClient = useQueryClient();

  const { data: users, isLoading, error: fetchError } = useQuery({
    queryKey: ['app-users'],
    queryFn: fetchUsers,
    staleTime: 30_000,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['app-users'] });

  const createMutation = useMutation({
    mutationFn: (input: CreateUserInput) => createUser(input),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: (input: UpdateUserInput) => updateUser(input),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: invalidate,
  });

  return {
    users: users ?? [],
    isLoading,
    fetchError,
    createUser: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateUser: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteUser: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
