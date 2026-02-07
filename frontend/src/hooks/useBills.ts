import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Bill, BillStatus } from '../data/mockBills';

// Backend returns RecurringTemplate with nested category and account
interface ApiBill {
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

// Compute bill status from nextDueDate
function computeStatus(nextDueDate: string): BillStatus {
  const due = new Date(nextDueDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'overdue';
  if (diffDays <= 3) return 'due_soon';
  return 'upcoming';
}

function mapBill(b: ApiBill): Bill {
  const dueDate = typeof b.nextDueDate === 'string' ? b.nextDueDate.slice(0, 10) : b.nextDueDate;
  return {
    id: b.id,
    name: b.name,
    amount: Number(b.amount),
    dueDate,
    category: b.category.name,
    categoryColor: b.category.color,
    categoryId: b.categoryId,
    accountId: b.accountId,
    frequency: b.frequency,
    status: computeStatus(dueDate),
    isRecurring: true,
    autopay: b.isAutopay,
    notes: b.notes ?? undefined,
  };
}

export function useBills() {
  return useQuery({
    queryKey: ['bills'],
    queryFn: () => api.get<{ data: ApiBill[] }>('/api/bills'),
    select: (res) => res.data.map(mapBill),
  });
}

export function useCreateBill() {
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
    }) => api.post<{ data: ApiBill }>('/api/bills', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    },
  });
}

export function useUpdateBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: {
      id: string;
      name?: string;
      amount?: number;
      frequency?: string;
      nextDueDate?: string;
      categoryId?: string;
      accountId?: string;
      isAutopay?: boolean;
      isActive?: boolean;
      notes?: string;
    }) => api.put<{ data: ApiBill }>(`/api/bills/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    },
  });
}

export function useDeleteBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/bills/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    },
  });
}

export function useGenerateOccurrence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/api/bills/${id}/generate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useMarkBillPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      api.post(`/api/bills/${id}/mark-paid`, { amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['billPayments'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Bill payment = a transaction generated from a recurring template
interface ApiBillPayment {
  id: string;
  description: string;
  amount: string | number;
  date: string;
  recurringTemplateId: string;
  category: { id: string; name: string; type: string; color: string };
  account: { id: string; name: string; lastFour: string };
  recurringTemplate: { id: string; name: string; isAutopay: boolean; frequency: string };
}

function mapBillPayment(p: ApiBillPayment): Bill {
  const paidDate = typeof p.date === 'string' ? p.date.slice(0, 10) : p.date;
  return {
    id: `payment-${p.id}`,
    name: p.description,
    amount: Math.abs(Number(p.amount)),
    dueDate: paidDate,
    paidDate,
    category: p.category.name,
    categoryColor: p.category.color,
    status: 'paid',
    isRecurring: true,
    autopay: p.recurringTemplate.isAutopay,
  };
}

export function useBillPayments(from: string, to: string) {
  return useQuery({
    queryKey: ['billPayments', from, to],
    queryFn: () => api.get<{ data: ApiBillPayment[] }>(`/api/bills/payments?from=${from}&to=${to}`),
    select: (res) => res.data.map(mapBillPayment),
    enabled: !!from && !!to,
  });
}
