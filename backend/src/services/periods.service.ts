import { prisma } from '../config/database.js';
import { getPeriodDateRange } from '../utils/dates.js';

export async function getOrCreatePeriod(year: number, month: number, half: number) {
  let period = await prisma.period.findUnique({
    where: { year_month_half: { year, month, half } },
    include: { budgets: { include: { category: true } } },
  });

  if (!period) {
    period = await prisma.period.create({
      data: { year, month, half },
      include: { budgets: { include: { category: true } } },
    });
  }

  return period;
}

export async function computeActuals(year: number, month: number, half: number) {
  const { start, end } = getPeriodDateRange(year, month, half);

  const transactions = await prisma.transaction.findMany({
    where: { date: { gte: start, lte: end } },
    include: { category: true, account: true },
  });

  let actualIncome = 0;
  let actualExpenses = 0;
  let actualTransfers = 0;

  for (const tx of transactions) {
    const amount = Number(tx.amount);
    if (tx.category.name === 'Transfer') {
      actualTransfers += amount;
    } else if (amount > 0) {
      actualIncome += amount;
    } else {
      actualExpenses += Math.abs(amount);
    }
  }

  return { actualIncome, actualExpenses, actualTransfers, transactions };
}

export async function getPeriodWithActuals(year: number, month: number, half: number) {
  const period = await getOrCreatePeriod(year, month, half);
  const actuals = await computeActuals(year, month, half);

  const startingBalance = Number(period.startingBalance);
  const endingBalance = startingBalance + actuals.actualIncome - actuals.actualExpenses + actuals.actualTransfers;
  const projectedEndingBalance = startingBalance + Number(period.projectedIncome) - Number(period.projectedExpenses);

  return {
    ...period,
    startingBalance,
    projectedIncome: Number(period.projectedIncome),
    projectedExpenses: Number(period.projectedExpenses),
    ...actuals,
    endingBalance,
    projectedEndingBalance,
  };
}

export async function getCurrentPeriod() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const half = now.getDate() <= 15 ? 1 : 2;
  return getPeriodWithActuals(year, month, half);
}

export async function listPeriods(page = 1, pageSize = 12) {
  const skip = (page - 1) * pageSize;
  const [data, total] = await Promise.all([
    prisma.period.findMany({
      orderBy: [{ year: 'desc' }, { month: 'desc' }, { half: 'desc' }],
      skip,
      take: pageSize,
      include: { budgets: { include: { category: true } } },
    }),
    prisma.period.count(),
  ]);
  return { data, meta: { total, page, pageSize } };
}

export async function setBudget(periodId: string, categoryId: string, budgetedAmount: number) {
  return prisma.budget.upsert({
    where: { periodId_categoryId: { periodId, categoryId } },
    update: { budgetedAmount },
    create: { periodId, categoryId, budgetedAmount },
    include: { category: true },
  });
}

export async function updatePeriod(id: string, data: {
  startingBalance?: number;
  projectedIncome?: number;
  projectedExpenses?: number;
  notes?: string;
}) {
  return prisma.period.update({
    where: { id },
    data,
    include: { budgets: { include: { category: true } } },
  });
}
