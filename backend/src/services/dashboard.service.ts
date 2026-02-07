import { prisma } from '../config/database.js';
import * as periodsService from './periods.service.js';
import * as assetsService from './assets.service.js';

export async function getDashboard() {
  const [currentPeriod, netWorth, accounts, recentTransactions, upcomingBills] = await Promise.all([
    periodsService.getCurrentPeriod(),

    assetsService.getNetWorth(),

    prisma.account.findMany({
      where: { isActive: true },
      orderBy: { type: 'asc' },
    }),

    prisma.transaction.findMany({
      orderBy: { date: 'desc' },
      take: 10,
      include: { account: true, category: true },
    }),

    prisma.recurringTemplate.findMany({
      where: {
        isActive: true,
        templateType: 'bill',
        nextDueDate: {
          lte: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { nextDueDate: 'asc' },
      include: { category: true, account: true },
    }),
  ]);

  const spendingByCategory = new Map<string, { name: string; amount: number; color: string }>();
  for (const tx of currentPeriod.transactions) {
    const amount = Number(tx.amount);
    if (amount < 0) {
      const key = tx.category.name;
      if (!spendingByCategory.has(key)) {
        spendingByCategory.set(key, { name: key, amount: 0, color: tx.category.color });
      }
      spendingByCategory.get(key)!.amount += Math.abs(amount);
    }
  }

  return {
    periodMetrics: {
      totalBalance: accounts.reduce((sum, a) => sum + Number(a.balance), 0),
      income: currentPeriod.actualIncome,
      expenses: currentPeriod.actualExpenses,
      netCashFlow: currentPeriod.actualIncome - currentPeriod.actualExpenses,
    },
    accounts,
    recentTransactions,
    upcomingBills,
    netWorth,
    spendingByCategory: Array.from(spendingByCategory.values())
      .sort((a, b) => b.amount - a.amount),
  };
}
