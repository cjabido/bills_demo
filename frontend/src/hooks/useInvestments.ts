import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

interface ApiInvestment {
  id: string;
  name: string;
  amount: string | number;
  frequency: string;
  nextDueDate: string;
  categoryId: string;
  accountId: string;
  isAutopay: boolean;
  isActive: boolean;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    type: string;
    color: string;
  };
  account: {
    id: string;
    name: string;
    lastFour: string;
  };
}

export interface RecurringInvestment {
  id: string;
  name: string;
  amount: number;
  frequency: string;
  nextDueDate: string;
  accountId: string;
  accountName: string;
  accountLastFour: string;
  isAutopay: boolean;
  isActive: boolean;
  notes?: string;
  daysUntil: number;
}

function mapInvestment(inv: ApiInvestment): RecurringInvestment {
  const dueDate = typeof inv.nextDueDate === 'string' ? inv.nextDueDate.slice(0, 10) : inv.nextDueDate;
  const due = new Date(dueDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const daysUntil = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return {
    id: inv.id,
    name: inv.name,
    amount: Number(inv.amount),
    frequency: inv.frequency,
    nextDueDate: dueDate,
    accountId: inv.accountId,
    accountName: inv.account.name,
    accountLastFour: inv.account.lastFour,
    isAutopay: inv.isAutopay,
    isActive: inv.isActive,
    notes: inv.notes ?? undefined,
    daysUntil,
  };
}

export function useInvestments() {
  return useQuery({
    queryKey: ['investments'],
    queryFn: () => api.get<{ data: ApiInvestment[] }>('/api/investments'),
    select: (res) => res.data.map(mapInvestment),
  });
}

export function useCreateInvestment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      amount: number;
      frequency: string;
      nextDueDate: string;
      categoryId: string;
      accountId: string;
      isAutopay?: boolean;
      notes?: string;
    }) => api.post<{ data: ApiInvestment }>('/api/investments', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
    },
  });
}

export function useMarkContributed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      api.post(`/api/investments/${id}/mark-contributed`, { amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}
