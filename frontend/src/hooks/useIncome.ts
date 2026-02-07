import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { IncomeSource, IncomeStatus } from '../data/incomeTypes';

interface ApiIncomeSource {
  id: string;
  name: string;
  amount: string | number;
  frequency: string;
  nextDueDate: string;
  categoryId: string;
  accountId: string;
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

function computeStatus(nextDueDate: string): IncomeStatus {
  const due = new Date(nextDueDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'overdue';
  return 'expected';
}

function mapIncomeSource(s: ApiIncomeSource): IncomeSource {
  const expectedDate = typeof s.nextDueDate === 'string' ? s.nextDueDate.slice(0, 10) : s.nextDueDate;
  return {
    id: s.id,
    name: s.name,
    amount: Number(s.amount),
    expectedDate,
    category: s.category.name,
    categoryColor: s.category.color,
    categoryId: s.categoryId,
    accountId: s.accountId,
    frequency: s.frequency,
    status: computeStatus(expectedDate),
    isRecurring: true,
    notes: s.notes ?? undefined,
  };
}

export function useIncomeSources() {
  return useQuery({
    queryKey: ['incomeSources'],
    queryFn: () => api.get<{ data: ApiIncomeSource[] }>('/api/income'),
    select: (res) => res.data.map(mapIncomeSource),
  });
}

export interface IncomePayload {
  name: string;
  amount: number;
  frequency: string;
  nextDueDate: string;
  categoryId: string;
  accountId: string;
  notes?: string;
}

export function useCreateIncomeSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: IncomePayload) =>
      api.post<{ data: ApiIncomeSource }>('/api/income', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomeSources'] });
    },
  });
}

export function useUpdateIncomeSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<IncomePayload> & { isActive?: boolean }) =>
      api.put<{ data: ApiIncomeSource }>(`/api/income/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomeSources'] });
    },
  });
}

export function useDeleteIncomeSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/income/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomeSources'] });
    },
  });
}

export function useMarkIncomeReceived() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      api.post(`/api/income/${id}/mark-received`, { amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomeSources'] });
      queryClient.invalidateQueries({ queryKey: ['incomePayments'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['periods'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

interface ApiIncomePayment {
  id: string;
  description: string;
  amount: string | number;
  date: string;
  recurringTemplateId: string;
  category: { id: string; name: string; type: string; color: string };
  account: { id: string; name: string; lastFour: string };
  recurringTemplate: { id: string; name: string; frequency: string };
}

function mapIncomePayment(p: ApiIncomePayment): IncomeSource {
  const receivedDate = typeof p.date === 'string' ? p.date.slice(0, 10) : p.date;
  return {
    id: `received-${p.id}`,
    name: p.description,
    amount: Number(p.amount),
    expectedDate: receivedDate,
    receivedDate,
    category: p.category.name,
    categoryColor: p.category.color,
    status: 'received',
    isRecurring: true,
  };
}

export function useIncomePayments(from: string, to: string) {
  return useQuery({
    queryKey: ['incomePayments', from, to],
    queryFn: () => api.get<{ data: ApiIncomePayment[] }>(`/api/income/payments?from=${from}&to=${to}`),
    select: (res) => res.data.map(mapIncomePayment),
    enabled: !!from && !!to,
  });
}
