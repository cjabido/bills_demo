import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { CashFlowPeriod, PeriodHalf } from '../data/mockCashFlow';

// Backend period shape from getPeriodWithActuals
interface ApiPeriodWithActuals {
  id: string;
  year: number;
  month: number;
  half: number;
  startingBalance: number | string;
  projectedIncome: number | string;
  projectedExpenses: number | string;
  notes?: string | null;
  budgets: ApiBudget[];
  actualIncome: number;
  actualExpenses: number;
  actualTransfers: number;
  endingBalance: number;
  projectedEndingBalance: number;
  transactions: ApiPeriodTransaction[];
}

interface ApiBudget {
  id: string;
  periodId: string;
  categoryId: string;
  budgetedAmount: string | number;
  category: {
    id: string;
    name: string;
    type: string;
    color: string;
  };
}

interface ApiPeriodTransaction {
  id: string;
  description: string;
  merchant: string;
  amount: string | number;
  date: string;
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

// The raw period from listPeriods (no computed actuals)
interface ApiPeriodRaw {
  id: string;
  year: number;
  month: number;
  half: number;
  startingBalance: string | number;
  projectedIncome: string | number;
  projectedExpenses: string | number;
  notes?: string | null;
  budgets: ApiBudget[];
}

interface PeriodsListResponse {
  data: ApiPeriodRaw[];
  meta: { total: number; page: number; pageSize: number };
}

function halfLabel(half: number): PeriodHalf {
  return half === 1 ? '1H' : '2H';
}

function mapPeriodWithActuals(p: ApiPeriodWithActuals): CashFlowPeriod {
  return {
    year: p.year,
    month: p.month,
    half: halfLabel(p.half),
    startingBalance: Number(p.startingBalance),
    endingBalance: Number(p.endingBalance),
    projectedEndingBalance: Number(p.projectedEndingBalance),
    totalIncome: Number(p.actualIncome),
    projectedIncome: Number(p.projectedIncome),
    totalExpenses: Number(p.actualExpenses),
    projectedExpenses: Number(p.projectedExpenses),
    totalTransfers: Number(p.actualTransfers),
  };
}

export { type ApiPeriodWithActuals, type ApiPeriodTransaction, type ApiBudget };

export function usePeriods(page?: number) {
  return useQuery({
    queryKey: ['periods', page],
    queryFn: () => api.get<PeriodsListResponse>(`/api/periods${page ? `?page=${page}` : ''}`),
    select: (res) => ({
      data: res.data,
      meta: res.meta,
    }),
  });
}

export function useCurrentPeriod() {
  return useQuery({
    queryKey: ['periods', 'current'],
    queryFn: () => api.get<{ data: ApiPeriodWithActuals }>('/api/periods/current'),
    select: (res) => res.data,
  });
}

export function usePeriod(year: number, month: number, half: number) {
  return useQuery({
    queryKey: ['periods', year, month, half],
    queryFn: () => api.get<{ data: ApiPeriodWithActuals }>(`/api/periods/${year}/${month}/${half}`),
    select: (res) => res.data,
    enabled: year > 0 && month > 0 && half > 0,
  });
}

// Export mapPeriodWithActuals for use in CashFlowPage
export { mapPeriodWithActuals };

export function useSetBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ periodId, categoryId, budgetedAmount }: {
      periodId: string;
      categoryId: string;
      budgetedAmount: number;
    }) => api.put(`/api/periods/${periodId}/budget`, { categoryId, budgetedAmount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['periods'] });
    },
  });
}
