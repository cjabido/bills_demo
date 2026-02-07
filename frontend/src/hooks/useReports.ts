import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { MonthlySummary, CategorySpending, TopMerchant, NetWorthPoint } from '../data/mockReports';

export function useMonthlySummary(months?: number) {
  return useQuery({
    queryKey: ['reports', 'monthly', months],
    queryFn: () => api.get<{ data: MonthlySummary[] }>(
      `/api/reports/monthly${months ? `?months=${months}` : ''}`
    ),
    select: (res) => res.data,
  });
}

export function useCategorySpending(from?: string, to?: string) {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const qs = params.toString();

  return useQuery({
    queryKey: ['reports', 'spending', from, to],
    queryFn: () => api.get<{ data: CategorySpending[] }>(
      `/api/reports/spending${qs ? `?${qs}` : ''}`
    ),
    select: (res) => res.data,
  });
}

export function useTopMerchants(limit?: number, from?: string, to?: string) {
  const params = new URLSearchParams();
  if (limit) params.set('limit', String(limit));
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const qs = params.toString();

  return useQuery({
    queryKey: ['reports', 'merchants', limit, from, to],
    queryFn: () => api.get<{ data: TopMerchant[] }>(
      `/api/reports/merchants${qs ? `?${qs}` : ''}`
    ),
    select: (res) => res.data,
  });
}

export function useNetWorthHistory(months?: number) {
  return useQuery({
    queryKey: ['reports', 'netWorth', months],
    queryFn: () => api.get<{ data: NetWorthPoint[] }>(
      `/api/reports/net-worth${months ? `?months=${months}` : ''}`
    ),
    select: (res) => res.data,
  });
}
