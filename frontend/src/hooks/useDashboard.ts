import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Account } from '../data/mockDashboard';

// Dashboard API response shape matching dashboard.service.ts
interface ApiDashboardTransaction {
  id: string;
  description: string;
  merchant: string;
  amount: string | number;
  date: string;
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

interface ApiDashboardBill {
  id: string;
  name: string;
  amount: string | number;
  nextDueDate: string;
  isAutopay: boolean;
  category: {
    id: string;
    name: string;
  };
  account: {
    id: string;
    name: string;
  };
}

interface ApiDashboardAccount {
  id: string;
  name: string;
  type: string;
  institution: string;
  lastFour: string;
  balance: string | number;
  isActive: boolean;
}

interface ApiDashboardNetWorth {
  assets: number;
  liabilities: number;
  netWorth: number;
}

interface ApiSpendingCategory {
  name: string;
  amount: number;
  color: string;
}

interface ApiDashboard {
  periodMetrics: {
    totalBalance: number;
    income: number;
    expenses: number;
    netCashFlow: number;
  };
  accounts: ApiDashboardAccount[];
  recentTransactions: ApiDashboardTransaction[];
  upcomingBills: ApiDashboardBill[];
  netWorth: ApiDashboardNetWorth;
  spendingByCategory: ApiSpendingCategory[];
}

// Mapped dashboard types for the frontend
export interface DashboardData {
  periodMetrics: {
    totalBalance: number;
    income: number;
    expenses: number;
    netCashFlow: number;
  };
  accounts: Account[];
  recentTransactions: {
    id: string;
    description: string;
    amount: number;
    date: string;
    category: string;
    accountName: string;
  }[];
  upcomingBills: {
    id: string;
    name: string;
    amount: number;
    dueDate: string;
    daysUntil: number;
  }[];
  netWorth: ApiDashboardNetWorth;
  spending: {
    name: string;
    amount: number;
    color: string;
    bgColor: string;
  }[];
}

// Map hex color from backend to Tailwind classes
const COLOR_MAP: Record<string, { color: string; bgColor: string }> = {
  '#10b981': { color: 'text-accent-mint', bgColor: 'bg-accent-mint-dim' },
  '#f59e0b': { color: 'text-accent-amber', bgColor: 'bg-accent-amber-dim' },
  '#0284c7': { color: 'text-accent-sky', bgColor: 'bg-accent-sky-dim' },
  '#7c3aed': { color: 'text-accent-violet', bgColor: 'bg-accent-violet-dim' },
  '#e84393': { color: 'text-accent-rose', bgColor: 'bg-accent-rose-dim' },
  '#8a8aa0': { color: 'text-text-secondary', bgColor: 'bg-surface-3' },
};

function colorToClasses(hexColor: string) {
  return COLOR_MAP[hexColor] ?? { color: 'text-text-secondary', bgColor: 'bg-surface-3' };
}

function mapDashboard(d: ApiDashboard): DashboardData {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return {
    periodMetrics: d.periodMetrics,
    accounts: d.accounts.map(a => ({
      id: a.id,
      name: a.name,
      type: a.type as Account['type'],
      institution: a.institution,
      lastFour: a.lastFour,
      balance: Number(a.balance),
    })),
    recentTransactions: d.recentTransactions.map(tx => ({
      id: tx.id,
      description: tx.description,
      amount: Number(tx.amount),
      date: typeof tx.date === 'string' ? tx.date.slice(0, 10) : tx.date,
      category: tx.category.name,
      accountName: tx.account.name,
    })),
    upcomingBills: d.upcomingBills.map(b => {
      const dueDate = typeof b.nextDueDate === 'string' ? b.nextDueDate.slice(0, 10) : b.nextDueDate;
      const due = new Date(dueDate);
      due.setHours(0, 0, 0, 0);
      const diffMs = due.getTime() - now.getTime();
      const daysUntil = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      return {
        id: b.id,
        name: b.name,
        amount: Number(b.amount),
        dueDate,
        daysUntil,
      };
    }),
    netWorth: d.netWorth,
    spending: d.spendingByCategory.map(s => ({
      name: s.name,
      amount: s.amount,
      ...colorToClasses(s.color),
    })),
  };
}

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get<{ data: ApiDashboard }>('/api/dashboard'),
    select: (res) => mapDashboard(res.data),
  });
}
