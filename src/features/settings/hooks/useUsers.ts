import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createUser, fetchUsers } from '../api/usersApi';
import type { CreateUserInput } from '../types';

export function useUsers() {
  const queryClient = useQueryClient();

  const { data: users, isLoading, error: fetchError } = useQuery({
    queryKey: ['app-users'],
    queryFn: fetchUsers,
    staleTime: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateUserInput) => createUser(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['app-users'] });
    },
  });

  return {
    users: users ?? [],
    isLoading,
    fetchError,
    createUser: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}
