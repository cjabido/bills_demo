import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

// Backend returns Account model for asset accounts
interface ApiAssetAccount {
  id: string;
  name: string;
  type: string;
  institution: string;
  lastFour: string;
  balance: string | number;
  isActive: boolean;
  isTaxable: boolean;
  createdAt: string;
  updatedAt: string;
}

// Backend returns AssetSnapshot with account relation
interface ApiAssetSnapshot {
  id: string;
  accountId: string;
  date: string;
  balance: string | number;
  costBasis: string | number;
  account: {
    id: string;
    name: string;
    type: string;
    institution: string;
    lastFour: string;
  };
}

interface ApiNetWorth {
  assets: number;
  liabilities: number;
  netWorth: number;
}

export function useAssetAccounts() {
  return useQuery({
    queryKey: ['assets', 'accounts'],
    queryFn: () => api.get<{ data: ApiAssetAccount[] }>('/api/assets'),
    select: (res) => res.data.map(a => ({
      ...a,
      balance: Number(a.balance),
    })),
  });
}

export function useAssetHistory(accountId?: string, months?: number) {
  const params = new URLSearchParams();
  if (accountId) params.set('accountId', accountId);
  if (months) params.set('months', String(months));
  const qs = params.toString();

  return useQuery({
    queryKey: ['assets', 'history', accountId, months],
    queryFn: () => api.get<{ data: ApiAssetSnapshot[] }>(`/api/assets/history${qs ? `?${qs}` : ''}`),
    select: (res) => res.data.map(s => ({
      ...s,
      balance: Number(s.balance),
      costBasis: Number(s.costBasis),
      date: typeof s.date === 'string' ? s.date.slice(0, 10) : s.date,
    })),
  });
}

export function useNetWorth() {
  return useQuery({
    queryKey: ['assets', 'netWorth'],
    queryFn: () => api.get<{ data: ApiNetWorth }>('/api/assets/net-worth'),
    select: (res) => res.data,
  });
}

export function useCreateSnapshot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      accountId: string;
      date: string;
      balance: number;
      costBasis?: number;
    }) => api.post('/api/assets/snapshots', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
