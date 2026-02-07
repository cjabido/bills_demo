import { prisma } from '../config/database.js';

export async function listAssetAccounts() {
  return prisma.account.findMany({
    where: { type: { in: ['investment', 'savings', 'checking'] }, isActive: true },
    orderBy: { name: 'asc' },
  });
}

export async function createSnapshot(data: {
  accountId: string;
  date: string;
  balance: number;
  costBasis?: number;
}) {
  return prisma.assetSnapshot.create({
    data: {
      accountId: data.accountId,
      date: new Date(data.date),
      balance: data.balance,
      costBasis: data.costBasis ?? 0,
    },
    include: { account: true },
  });
}

export async function getHistory(accountId?: string, months = 12) {
  const since = new Date();
  since.setMonth(since.getMonth() - months);

  return prisma.assetSnapshot.findMany({
    where: {
      ...(accountId ? { accountId } : {}),
      date: { gte: since },
    },
    orderBy: { date: 'asc' },
    include: { account: true },
  });
}

export async function getNetWorth() {
  const accounts = await prisma.account.findMany({
    where: { isActive: true },
  });

  let assets = 0;
  let liabilities = 0;

  for (const account of accounts) {
    const balance = Number(account.balance);
    if (account.type === 'credit_card' || account.type === 'loan') {
      liabilities += Math.abs(balance);
    } else {
      assets += balance;
    }
  }

  return { assets, liabilities, netWorth: assets - liabilities };
}
