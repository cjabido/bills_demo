import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { TX_CATEGORY_CONFIG, type TxRecord, type TxCategory } from '../data/mockTransactions';

// Backend transaction includes nested account and category from Prisma
interface ApiTransaction {
  id: string;
  description: string;
  merchant: string;
  amount: string | number;
  date: string;
  accountId: string;
  categoryId: string;
  notes?: string | null;
  account: {
    id: string;
    name: string;
    lastFour: string;
  };
  category: {
    id: string;
    name: string;
    type: string;
    color: string;
  };
}

interface TransactionsResponse {
  data: ApiTransaction[];
  meta: { total: number; page: number; pageSize: number };
}

function mapCategory(name: string): TxCategory {
  const key = name.toLowerCase().replace(/\s+/g, '_') as TxCategory;
  return key in TX_CATEGORY_CONFIG ? key : 'other';
}

function mapTransaction(tx: ApiTransaction): TxRecord {
  return {
    id: tx.id,
    description: tx.description,
    merchant: tx.merchant,
    amount: Number(tx.amount),
    date: typeof tx.date === 'string' ? tx.date.slice(0, 10) : tx.date,
    category: mapCategory(tx.category.name),
    accountName: tx.account.name,
    accountLastFour: tx.account.lastFour,
    notes: tx.notes ?? undefined,
  };
}

export interface TransactionParams {
  page?: number;
  pageSize?: number;
  from?: string;
  to?: string;
  categoryId?: string;
  accountId?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export function useTransactions(params?: TransactionParams) {
  const queryString = params
    ? '?' + new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined && v !== '')
          .map(([k, v]) => [k, String(v)])
      ).toString()
    : '';

  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => api.get<TransactionsResponse>(`/api/transactions${queryString}`),
    select: (res) => ({
      data: res.data.map(mapTransaction),
      meta: res.meta,
    }),
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      description: string;
      merchant: string;
      amount: number;
      date: string;
      accountId: string;
      categoryId: string;
      notes?: string;
    }) => api.post<{ data: ApiTransaction }>('/api/transactions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['periods'] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: {
      id: string;
      description?: string;
      merchant?: string;
      amount?: number;
      date?: string;
      accountId?: string;
      categoryId?: string;
      notes?: string;
    }) => api.put<{ data: ApiTransaction }>(`/api/transactions/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['periods'] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/transactions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['periods'] });
    },
  });
}

export function useRecategorizeTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, categoryId }: { id: string; categoryId: string }) =>
      api.patch<{ data: ApiTransaction }>(`/api/transactions/${id}/category`, { categoryId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['periods'] });
    },
  });
}
