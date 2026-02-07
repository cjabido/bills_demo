import { prisma } from '../config/database.js';
import { startOfMonth, subMonths, format } from 'date-fns';

export async function getMonthlySummary(months = 12) {
  const since = startOfMonth(subMonths(new Date(), months - 1));

  const transactions = await prisma.transaction.findMany({
    where: { date: { gte: since } },
    include: { category: true },
    orderBy: { date: 'asc' },
  });

  const byMonth = new Map<string, { income: number; expenses: number }>();

  for (const tx of transactions) {
    const key = format(tx.date, 'yyyy-MM');
    if (!byMonth.has(key)) byMonth.set(key, { income: 0, expenses: 0 });
    const entry = byMonth.get(key)!;
    const amount = Number(tx.amount);
    if (amount > 0) entry.income += amount;
    else entry.expenses += Math.abs(amount);
  }

  return Array.from(byMonth.entries()).map(([month, vals]) => ({
    month,
    label: format(new Date(month + '-01'), 'MMM yyyy'),
    income: vals.income,
    expenses: vals.expenses,
    net: vals.income - vals.expenses,
    savingsRate: vals.income > 0 ? ((vals.income - vals.expenses) / vals.income) * 100 : 0,
  }));
}

export async function getCategorySpending(from?: string, to?: string) {
  const where: Record<string, unknown> = {
    amount: { lt: 0 },
  };
  if (from || to) {
    const dateFilter: Record<string, Date> = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) dateFilter.lte = new Date(to);
    where.date = dateFilter;
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: { category: true },
  });

  const byCategory = new Map<string, { amount: number; count: number; color: string }>();

  for (const tx of transactions) {
    const key = tx.category.name;
    if (!byCategory.has(key)) byCategory.set(key, { amount: 0, count: 0, color: tx.category.color });
    const entry = byCategory.get(key)!;
    entry.amount += Math.abs(Number(tx.amount));
    entry.count++;
  }

  const total = Array.from(byCategory.values()).reduce((s, v) => s + v.amount, 0);

  return Array.from(byCategory.entries())
    .map(([category, vals]) => ({
      category,
      amount: vals.amount,
      percentage: total > 0 ? (vals.amount / total) * 100 : 0,
      color: vals.color,
      transactions: vals.count,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export async function getTopMerchants(limit = 10, from?: string, to?: string) {
  const where: Record<string, unknown> = {
    amount: { lt: 0 },
  };
  if (from || to) {
    const dateFilter: Record<string, Date> = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) dateFilter.lte = new Date(to);
    where.date = dateFilter;
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: { category: true },
  });

  const byMerchant = new Map<string, { amount: number; count: number; category: string }>();

  for (const tx of transactions) {
    const key = tx.merchant;
    if (!byMerchant.has(key)) byMerchant.set(key, { amount: 0, count: 0, category: tx.category.name });
    const entry = byMerchant.get(key)!;
    entry.amount += Math.abs(Number(tx.amount));
    entry.count++;
  }

  return Array.from(byMerchant.entries())
    .map(([name, vals]) => ({
      name,
      amount: vals.amount,
      transactions: vals.count,
      category: vals.category,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

export async function getNetWorthHistory(months = 12) {
  const since = startOfMonth(subMonths(new Date(), months - 1));

  const snapshots = await prisma.assetSnapshot.findMany({
    where: { date: { gte: since } },
    include: { account: true },
    orderBy: { date: 'asc' },
  });

  const byMonth = new Map<string, Map<string, { balance: number; isLiability: boolean }>>();

  for (const snap of snapshots) {
    const key = format(snap.date, 'yyyy-MM');
    if (!byMonth.has(key)) byMonth.set(key, new Map());
    const monthMap = byMonth.get(key)!;
    const isLiability = snap.account.type === 'credit_card' || snap.account.type === 'loan';
    monthMap.set(snap.accountId, { balance: Number(snap.balance), isLiability });
  }

  return Array.from(byMonth.entries()).map(([month, accounts]) => {
    let assets = 0;
    let liabilities = 0;
    for (const { balance, isLiability } of accounts.values()) {
      if (isLiability) liabilities += Math.abs(balance);
      else assets += balance;
    }
    return {
      month,
      label: format(new Date(month + '-01'), 'MMM yyyy'),
      assets,
      liabilities,
      netWorth: assets - liabilities,
    };
  });
}
