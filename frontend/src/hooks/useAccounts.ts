import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { AccountDetail, AccountType } from '../data/mockAccounts';

// Backend returns Account model from Prisma (balance as string/Decimal, updatedAt, etc.)
// We map to the frontend AccountDetail shape.
interface ApiAccount {
  id: string;
  name: string;
  type: AccountType;
  institution: string;
  lastFour: string;
  balance: string | number;
  isActive: boolean;
  isTaxable: boolean;
  createdAt: string;
  updatedAt: string;
}

function mapAccount(a: ApiAccount): AccountDetail {
  return {
    id: a.id,
    name: a.name,
    type: a.type,
    institution: a.institution,
    lastFour: a.lastFour,
    balance: Number(a.balance),
    isActive: a.isActive,
    isTaxable: a.isTaxable,
    lastUpdated: a.updatedAt.slice(0, 10),
  };
}

export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: () => api.get<{ data: ApiAccount[] }>('/api/accounts'),
    select: (res) => res.data.map(mapAccount),
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; type: AccountType; institution: string; lastFour: string; balance?: number; isTaxable?: boolean }) =>
      api.post<{ data: ApiAccount }>('/api/accounts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; type?: AccountType; institution?: string; lastFour?: string; balance?: number; isTaxable?: boolean }) =>
      api.put<{ data: ApiAccount }>(`/api/accounts/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/accounts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useToggleAccountActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch<{ data: ApiAccount }>(`/api/accounts/${id}/active`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}
